# 表达式、块与隐式返回 —— 实现说明

**面向**：`tree-sitter-simy`（编辑器语法）与 `simy-core`（Rust 编译器）。
**对应**：`SYNTAX-REVISION.md` 的 **R21**（隐式返回 + 「一切皆表达式」，方案 B），并沿用
**R20**（`|>` 续行标记）。
**状态**：规范已定，尚未实现。本文是两个仓库对齐的**唯一依据**。

---

## 0. 一句话模型

> 声明、赋值、循环、`execute` 链、命令、`return` 是**语句**（无值）；
> 其余是**表达式**（有值）。块的值 = 最后一个表达式的值。
> 函数声明了 `-> T` 时，函数体的值即返回值。

Simy **没有语句终止符**；语句与表达式**由行首形式判定，绝不靠标点**。

---

## 1. 语句与表达式

解析器读到「行首 token」即可分类，无需向前看终止符。

| 行首形式                                                             | 类别   | 是否产生值 |
| :------------------------------------------------------------------- | :----- | :--------- |
| `let` / `const` / 赋值（`x = …`、`x += …`） / `return`               | 语句   | 否         |
| `while` / `for … in` / `repeat` / `execute …` / 裸 `{ }` 块          | 语句   | 否         |
| 命令（`effect give …`、`tellraw …`，无括号）                         | 语句   | 否         |
| 其余——字面量、标识符、`a + b`、`f(x)`、`@a[..]`、成员访问、`if … {}` | 表达式 | 是         |

要点：

- 表达式**可以当作语句**使用（其值被丢弃）。这在一行的非尾位自动发生，无需额外语法。
- **`let _ = expr`** 是显式丢弃。它本身是声明语句（无值），也正是「无 `-> T` 的函数」合法收尾的逃生舱
  （见 §3.3）。
- 命令与调用由结构区分：`f(x)` 是调用（表达式）；`f x` 是命令（语句，unit）。见
  `reference/functions.md#calling-a-function`。

---

## 2. 语法（给 `tree-sitter-simy`）

### 2.1 节点草图

```
source_file   := statement*
statement     := let_stmt | const_stmt | assign_stmt | return_stmt
               | while_stmt | for_stmt | repeat_stmt | execute_stmt
               | command_stmt | block | expression_stmt
expression_stmt := expression

expression    := literal | identifier | call | member | selector | unary | binary
               | if_expr                      // 见 2.3

if_expr       := 'if' expression block ('elif' expression block)* ('else' block)?
block         := '{' statement* '}'
```

- `if` / `elif` / `else` 只有**一个节点类型**（`if_expr`）。它既可作语句（值丢弃），也可出现在表达式位；
  两者是同一种节点、不同位置。
- `block` 既是语句，也在 `if_expr` 与函数体中充当「有值的块」。`block` 的值语义留给 `simy-core`（§3.1）。

### 2.2 与 R20（`|>` 续行）的衔接

- 一行以 `|>` 开头 ⇒ **延续上一条语句**，不是新语句。
- 实现：一条隐藏规则 `_line_continuation` 吞掉「行首（可含空白）+ `|>`」，等价于一个空格；并保证
  `|>` 的词法优先级高于 `|`。
- 顺序很重要：**先做完隐式续行合并，再做** §1 的语句/表达式分类。

### 2.3 `if` 出现在表达式位

- `if_expr` 可出现在任意 `expression` 位置——`let` 右侧、二元运算的一侧、函数体尾部。

```simy
let label = if hp <= 0 { "dead" } else { "alive" }
```

- 没有通用括号分组，因此 v0.1 的**实用** `if`-表达式位置是：`let` 右侧、函数体尾位、以及作为另一条
  `if` 分支的尾表达式。见 §7 开放问题。

### 2.4 块作为值的边界

块的值**可被观察**的位置只有两处：

1. **函数体**；
2. **`if` / `elif` / `else` 的分支体**（在 `if_expr` 处于值位时）。

> ⚠️ `{` 紧跟在 `=` 之后是**映射 / 结构字面量**（见 `reference/disambiguation.md`），因此
> `let x = { … }` **不是**块表达式，而是 map 字面量。Simy v0.1 **不提供**独立的块字面量作为任意表达式。

---

## 3. 语义（给 `simy-core`）

类型记法：`unit` = 无值。

### 3.1 块的值

```
value(block) = 最后一个 statement 若是 expression_stmt 则取其表达式，否则 unit
```

### 3.2 `if` 表达式的类型

设各分支体值为 `T1…Tn`。

- **有 `else`**（含 `elif` 链最终落到 `else`）：所有 `Ti` 必须**完全相同**，或**全部为 unit**；否则报
  `E-BRANCH-MISMATCH`。结果类型为 `Ti`。
- **无 `else`**：缺省分支视为 `unit`，故要求所有 `Ti` 均为 unit；否则 `E-BRANCH-MISMATCH`。
  （即：`if c { 1 }` 不能作为值使用。）

### 3.3 函数返回值

声明 `-> T` 时：

- 函数体的值必须为 `T`；注意 `T` 可以是 `unit`。
- 函数体**不以 `return` 结尾**时，隐式返回其值（§4.1）。
- 无 `-> T` 时：函数体值必须为 unit；若以值表达式结尾，报 `E-VALUE-WITHOUT-RETURN-TYPE`
  （这是用户拍板的 **D2 报错**）。

`return`：

- `return expr` 要求已声明 `-> T` 且 `expr` 类型为 `T`；否则 `E-RETURN-VALUE-NO-TYPE`
  （未声明）或 `E-RETURN-TYPE-MISMATCH`（类型不符）。
- 裸 `return`（无值）在 `-> T` 缺省或 `T = unit` 时合法。
- 函数体**最末尾**的 `return` 合法，但报 lint `L-REDUNDANT-RETURN`。

### 3.4 unit 的产生者（树 / 检查器共用）

命令语句、`execute` 链、`while` / `for … in` / `repeat`、赋值、`let` / `const`、无 `else` 且分支为 unit 的
`if`、以及尾位不是表达式的块。

---

## 4. 降级（lowering）

### 4.1 隐式返回 = 纯语法糖

在 AST 层 desugar，**不引入新 codegen 概念**：

```
fn f(…) -> T { S1; …; Sn; <expr> }   ⇒   fn f(…) -> T { S1; …; Sn; return <expr> }
```

`<expr>` 的降级随后复用既有 `return` 路径：物化到临时 `scoreboard` / `storage`，再 `return run …`
（见 `SYNTAX-REVISION.md` R17）。

### 4.2 `if` 作值

两种**观察等价**的策略，实现可任选：

1. **结果槽**：分配临时 `scoreboard` / `storage`；各分支把值写入该槽；表达式值 = 槽。
   当 `if` 结果作为**子表达式**使用时必须用此策略。
2. **尾位省略**（优化）：当该 `if` 恰是某 `-> T` 函数体的尾表达式时，各分支可各自降级为
   `return <expr>`，无需临时槽。

### 4.3 注意事项

- `execute` 链是**语句**（unit），不得出现在表达式位。
- `|>` 只是续行，占位等价空格，**不参与**降级。
- `return run` 的能力边界（尤其 `return run function …` 能否捕获被调函数的返回值）需对目标 MC
  版本核实，见 §7。

---

## 5. 诊断码

| 码                            | 触发                                         | 级别  |
| :---------------------------- | :------------------------------------------- | :---- |
| `E-BRANCH-MISMATCH`           | `if` 各分支类型不一致，或「有值 / 无值」混用 | error |
| `E-VALUE-WITHOUT-RETURN-TYPE` | 无 `-> T` 的函数体以值表达式结尾             | error |
| `E-RETURN-VALUE-NO-TYPE`      | `return expr` 但未声明 `-> T`                | error |
| `E-RETURN-TYPE-MISMATCH`      | 函数体值或 `return expr` 与 `-> T` 不符      | error |
| `L-REDUNDANT-RETURN`          | 函数体最末尾的 `return`                      | lint  |

---

## 6. 一致性测试语料（两仓库共用）

骨架如下；`tree-sitter-simy` 断言**解析树**，`simy-core` 断言**诊断 / 降级输出**。编号是共享 fixture ID。

| ID  | 输入（简写）                                                          | tree-sitter          | simy-core                        |
| :-- | :-------------------------------------------------------------------- | :------------------- | :------------------------------- |
| P01 | `fn f() -> num { 2 }`                                                 | block 尾为 expr      | ok                               |
| P02 | `fn f() -> num { let a = 1⏎a + 1 }`                                   | ok                   | ok                               |
| P03 | `fn f() -> num { let a = 1⏎return a }`                                | ok                   | ok + `L-REDUNDANT-RETURN`        |
| P04 | `fn f() -> str { if c { "a" } else { "b" } }`                         | `if_expr` 在尾位     | ok                               |
| P05 | `let x = if c { 1 } else { 2 }`                                       | `if_expr` 在表达式位 | ok（`x: num`）                   |
| P06 | `fn f() -> num { if a { 1 } elif b { 2 } else { 3 } }`                | 多分支 `if_expr`     | ok                               |
| P07 | `fn f() { tellraw @a "hi" }`                                          | 命令语句尾           | ok（unit）                       |
| P08 | `fn f() { let _ = g() }`                                              | 丢弃声明             | ok                               |
| P09 | `fn f() -> num { let a = 1⏎\|> a }`（续行）                           | 续行合并不产生新语句 | 见 R20（`\|>` 语义另测）         |
| N01 | `fn f() { 2 }`                                                        | ok（语法合法）       | `E-VALUE-WITHOUT-RETURN-TYPE`    |
| N02 | `fn f() -> num { if a { 1 } }`                                        | ok                   | `E-BRANCH-MISMATCH`（缺 else）   |
| N03 | `fn f() -> num { if a { 1 } else { "x" } }`                           | ok                   | `E-BRANCH-MISMATCH`              |
| N04 | `fn f() { return 1 }`                                                 | ok                   | `E-RETURN-VALUE-NO-TYPE`         |
| N05 | `fn f() -> num { "x" }`                                               | ok                   | `E-RETURN-TYPE-MISMATCH`         |
| N06 | `fn f() -> num { while t > 0 { t -= 1 } }`                            | `while` 为语句       | `E-RETURN-TYPE-MISMATCH`（unit） |
| N07 | `fn f() -> num { execute at @a { particle minecraft:flame ~ ~1 ~ } }` | `execute` 为语句     | `E-RETURN-TYPE-MISMATCH`（unit） |

> N01 与 P01 成对，专门钉住「无 `-> T` 却以值结尾」这条 D2 规则；N06 / N07 钉住「语句无值」。

---

## 7. 开放问题（确认后再实现）

1. **`num` 与 `float` 分支是否互相统一？** 建议 v0.1 **必须完全一致**，混用报 `E-BRANCH-MISMATCH`
   （定点数提升留待以后）。
2. **独立块字面量**：`{ … }` 出现在非 `=` 位置时是否允许作为表达式？v0.1 建议**不允许**，避免与 map
   字面量冲突（§2.4）。
3. **`if` 作为子表达式的消歧**：当前无通用括号分组。建议 v0.1 仅支持 §2.3 列出的实用位置，其余位置报错。
4. **`return run function …`** 的返回值捕获语义（依 MC 版本）。

---

## 8. 关联

- `SYNTAX-REVISION.md`：**R21**（本文）、**R20**（`|>` 续行）。
- 参考页：`docs/reference/functions.md#implicit-return`、
  `docs/reference/control-flow.md#if-as-an-expression`、
  `docs/reference/control-flow.md#statements-and-expressions`。
