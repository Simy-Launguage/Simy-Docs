# Simy 语法规范修订草案 · v0.1 → v0.2

> 范围：只覆盖分析里标为 **P0/P1** 的项（影响"理解负担"和"可编译性"的部分）。
> 每项结构：**现状规范原文 → 问题 → 改后规范文本（英文，可直接粘贴进 `docs/reference/*`）→ 前后对照 → 连带改动**。
> 待办（P2/P3）集中在文末，未展开。
>
> 约定：`docs/reference/*.md` 是英文规范，`docs/zh/reference/*.md` 是中文镜像。本文中标注
> `[EN §]` 的是英文页面的粘贴文本；中文镜像请照同一结构翻译。

## 索引

| 编号 | 主题                                       | 类型     | 主要影响页面             |
| :--- | :----------------------------------------- | :------- | :----------------------- |
| R1   | 命名参数块 `with(...)`，与函数调用彻底分离 | 语法     | commands                 |
| R2   | `execute` 目标去掉 `< >`                   | 语法     | control-flow             |
| R3   | 显式定义「调用 vs 命令」，消除隐性空白敏感 | 语法     | functions / commands     |
| R4   | 比较/相等运算符改为非结合                  | 语法     | operators                |
| R5   | 分数访问改为 `@s.scores.combo`             | 语法     | commands / operators     |
| R6   | 入口点注解 `#[tick]` / `#[load]`           | 新增语法 | 新页 / functions         |
| R7   | 有界循环 `repeat N { }`                    | 新增语法 | control-flow             |
| R8   | 字符串转义规则                             | 语法     | lexical                  |
| R9   | `at` 等 execute 动词降为上下文敏感         | 语法     | lexical / control-flow   |
| R10  | 原始命令逃生舱                             | 新增语法 | commands                 |
| R11  | 谓词表达式 vs 值布尔（语义规范）           | 语义     | control-flow / operators |
| R12  | 区间表达式与 `in`                          | 新增语法 | operators / control-flow |
| R13  | 新增「消歧规则」附录页                     | 结构     | 新页                     |

---

## R1 · 命名参数块

### 现状规范原文

> Arguments may end with an optional named-argument block: `(key: value, …)`.
>
> ```simy
> tellraw @s "combo x$comboCount!" (color: "red")
> ```

### 问题

`( )` 同时是「函数调用」「表达式分组」「命名参数块」「绝对坐标/向量」。区分依赖"`(` 是否紧贴
前一个标识符"——这是**隐性空白敏感**，与语言"显式、不靠空白"的原则冲突，且格式化器一旦补空格
就可能改变含义。

### 改后规范文本 `[EN §commands]`

````markdown
## Command options

A command statement may end with an optional **options block**, introduced by the
context-sensitive word `with`:

    <command head> <arguments…> with(key: value, …)

- `with` is a **context-sensitive word**: it is only special at the tail of a command
  statement. Elsewhere `with` is an ordinary identifier.
- The options block is a comma-separated list of `name: value` pairs.
- A command statement has at most one options block, and it must be the last element on
  the line.

```simy
tellraw @s "combo x$comboCount!" with(color: "red")
```
````

Because the block is introduced by a keyword, its meaning never depends on whitespace:
`with(color: "red")` and `with (color: "red")` are identical.

````

### 前后对照

```simy
// v0.1
tellraw @s "combo x$comboCount!" (color: "red")

// v0.2
tellraw @s "combo x$comboCount!" with(color: "red")
````

### 连带改动

- `docs/reference/commands.md`：替换「Arguments may end with…」段落。
- `docs/reference/examples.md` 第 42 行的例子。
- `docs/reference/lexical.md`：把 `with` 加入「上下文敏感词」表。
- `docs/.vitepress/simy.ts`：为 `with` 加一条 `keyword.other.options.simy` 规则。

---

## R2 · `execute` 目标去掉尖括号

### 现状规范原文

> Structured scopes replace native `execute` nesting. The scope target is written between
> `< … >`:
>
> ```simy
> execute at <@a> { … }
> ```

### 问题

`< >` 已经承担「泛型 `list<T>`」和「小于/大于」。再让它承担「execute 目标」，同一符号三义，
人和工具都容易读错。

### 改后规范文本 `[EN §control-flow]`

````markdown
## The `execute` context scope

Structured scopes replace native `execute` nesting. An `execute` scope is a sequence of one
or more **verb clauses**, terminated by `{ }`:

    execute <verb> <argument>… { … }

`execute` is followed by at least one clause from this list; clauses may be repeated and
combined in any order:

| Verb         | Argument          | Meaning                       |
| :----------- | :---------------- | :---------------------------- |
| `as`         | selector / entity | Run as the target             |
| `at`         | selector / entity | Run at the target's position  |
| `positioned` | pos               | Run at an absolute position   |
| `align`      | axes              | Round the position to axes    |
| `anchored`   | `eyes` / `feet`   | Move the anchor point         |
| `facing`     | pos / entity      | Face a position or entity     |
| `rotated`    | rotation          | Set the rotation              |
| `in`         | dimension         | Run in a dimension            |
| `if`         | test              | Run only when the test passes |
| `unless`     | test              | Run only when the test fails  |

A verb argument runs until the next verb keyword or the opening `{`, so multi-token
arguments such as `positioned ~ ~1 ~` and `if score $c matches 1..` work without brackets:

```simy
execute at @a {
    particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
}

execute as @s at ~ ~1 ~ if score $timer matches 1..100 {
    title @s actionbar "tick"
}
```
````

````

### 前后对照

```simy
// v0.1
execute at <@a> { … }

// v0.2
execute at @a { … }
````

### 连带改动

- `docs/reference/control-flow.md`：替换整节；补动词表。
- `docs/reference/commands.md`：坐标/向量表保持（`(x, y, z)` 仍在）。
- `docs/reference/examples.md`、`docs/guide/introduction.md`、`docs/guide/design-principles.md`：
  所有 `execute at <@a>` 例子。
- `docs/reference/lexical.md`：从「严格保留字」移除 `at`（见 R9）。

---

## R3 · 「调用 vs 命令」消除隐性空白敏感

### 现状规范原文

> `foo(a)` is always a function call, whereas `foo a b` is always a command — the presence of
> parentheses is what distinguishes the two.

### 问题

规范只说"有没有括号"，没说括号**是否必须紧贴**。所有例子都紧贴，但规则本身依赖空白：
`foo(a)` 与 `foo (a)` 的含义未被定义。这既与"不靠空白"的原则矛盾，也让格式化器和解析器都
有隐患。

### 改后规范文本 `[EN §functions]`

````markdown
## Calling a function

A **function call** is an identifier immediately followed by `(`, and it is an expression:

    foo(a, b)

A **command** is a statement whose head is an identifier followed by whitespace, and whose
arguments are structured atoms:

    foo a b

The two are distinguished by structure, not by guesswork:

- A `(` **directly adjacent** to an identifier is always a function call.
- A `(` **after whitespace**, in command-argument position, is only valid as a
  coordinate/vector atom — `(0, 64, 0)` or `(0.5, 1.0, -0.2)`. Any other parenthesised
  expression is a syntax error there.

```simy
calc_damage(victim)      // function call
calc_damage victim       // command (head `calc_damage`, argument `victim`)
tp @s (100, 64, 0)       // command, parenthesised coordinate atom
tp @s (x)                // error: a parenthesised expression is not a command atom
```
````

> **Formatter rule (normative).** Formatters MUST NOT insert whitespace between a call's
> identifier and its `(`, and MUST NOT remove it from a coordinate atom.

````

### 前后对照

```simy
// v0.1 未定义，v0.2 明确定义：
summon Spirit("Speed Spirit", "minecraft:speed")   // `summon` head + call argument
````

### 连带改动

- `docs/reference/functions.md`：「Calling a function」一节。
- `docs/reference/commands.md`：「Calls vs commands」小节。
- `docs/reference/conventions.md`：新增「格式化器规则」一行。

---

## R4 · 比较 / 相等运算符改为非结合

### 现状规范原文

> | 6 | `<` `>` `<=` `>=` | comparison | Left |
> | 7 | `==` `!=` | equality | Left |

### 问题

左结合让 `a < b < c` 解析成 `(a < b) < c`（布尔与数字比较），几乎永远是 bug，却静默通过。

### 改后规范文本 `[EN §operators]`

```markdown
Comparison and equality operators are **non-associative**: they cannot be chained without
parentheses. `a < b < c` is a syntax error. Write `(a < b) < c` if that is genuinely what you
mean — which it almost never is.

| Precedence | Operators         | Associativity   |
| :--------- | :---------------- | :-------------- |
| 6          | `<` `>` `<=` `>=` | Non-associative |
| 7          | `==` `!=`         | Non-associative |
```

### 连带改动

- `docs/reference/operators.md`：优先级表 `Associativity` 列 + 一句说明。

---

## R5 · 分数访问改为 `@s.scores.combo`

### 现状规范原文

> ```simy
> @s.score += 1
> tellraw @a "HP: ${target.health}"
> ```

### 问题

`target.health` 是**实体属性**，`@s.score` 里的 `score` 却是**用户自定义 objective 名**——
同一个 `.` 表达两种完全不同的东西，而且 objective 名是动态的，`@s.<obj>` 会读成"属性"。
这会让类型系统和读者都混淆。

### 改后规范文本 `[EN §commands]`

````markdown
### Scores

A score is accessed through the reserved pseudo-property `scores`, whose field is an
objective name:

```simy
@s.scores.combo += 1                 // increase the `combo` objective
tellraw @a "kills: ${@s.scores.kills}"
```
````

- `.scores.<objective>` reads or writes a user objective and is distinct from a domain
  property such as `target.health`.
- `<objective>` is an identifier, never a string. Generated objectives (`#simy/…`) are not
  identifiers, so user code can never touch them by accident.
- Entity/domain properties keep the plain form: `target.health`, `self.name`.

````

### 前后对照

```simy
// v0.1
@s.score += 1

// v0.2
@s.scores.combo += 1
````

### 连带改动

- `docs/reference/commands.md`：「Member access」小节。
- `docs/reference/examples.md` 第 41 行。
- `docs/reference/operators.md`：成员访问例子。

---

## R6 · 入口点注解 `#[tick]` / `#[load]`

### 现状

文档示例里有 `fn tick_handler()`，但**没有任何语法说明它如何成为数据包的 tick 函数**。

### 问题

没有入口点语法，生成的 datapack 无法自动运行。这是"能不能跑起来"的阻塞项。

### 改后规范文本（建议放入 `docs/reference/functions.md` 或新页）

````markdown
## Entry points

An attribute annotates the declaration that follows it. Attributes are written `#[name]` on
their own line directly above the item; `#` is not an identifier character, so attributes can
never collide with user names.

| Attribute | Meaning                                                | Emitted resource                         |
| :-------- | :----------------------------------------------------- | :--------------------------------------- |
| `#[tick]` | Run this function every game tick                      | `data/minecraft/tags/function/tick.json` |
| `#[load]` | Run this function once when the datapack is (re)loaded | `data/minecraft/tags/function/load.json` |

An annotated function takes no parameters and returns nothing. At most one `#[tick]` and one
`#[load]` function may exist per package; duplicates are a compile error.

```simy
#[tick]
fn tick_handler() {
    …
}

#[load]
fn setup() {
    scoreboard objectives add combo dummy
}
```
````

````

### 连带改动

- `docs/reference/functions.md`：新增「Entry points」一节。
- `docs/reference/examples.md`：给 `tick_handler` 加 `#[tick]`。
- `docs/reference/lexical.md`：注释一节补一句「属性 `#[…]` 不是注释」。

---

## R7 · 有界循环 `repeat N { }`

### 现状

只提供 `while`，但 mcfunction **没有循环**，`while` 必须降级为自递归函数，受
`maxCommandChainLength` 限制，且可能死循环卡死存档。

### 问题

需要一个"确定可编译"的有界循环作为默认选择。

### 改后规范文本 `[EN §control-flow]`

```markdown
## `repeat` (bounded loop)

```simy
repeat 10 {
    particle minecraft:flame ~ ~1 ~
}
````

- The count must be a **compile-time constant integer** (an integer literal, or a `const`).
- `repeat` unrolls to straight-line output: N copies of the body, no runtime recursion, no
  tick budget, guaranteed to terminate.
- If the count is not a compile-time constant, it is a compile error. Use `while` for
  data-dependent repetition, and keep in mind the recursion budget below.

## `while`

```simy
while timer > 0 {
    timer -= 1
}
```

Because `mcfunction` has no loops, `while` is lowered to a **self-recursive generated
function** (`execute if <test> run function simy:loop_…` followed by the body). This means:

- each iteration consumes a command-chain step, bounded by the game's
  `maxCommandChainLength`;
- a loop whose condition never becomes false will **hang the datapack**;
- prefer `repeat` whenever the iteration count is known.

````

### 前后对照

```simy
// 有界场景
// v0.1
let mut i = 0
while i < 10 { … i += 1 }

// v0.2
repeat 10 { … }
````

### 连带改动

- `docs/reference/control-flow.md`：新增 `repeat`，补 `while` 的降级说明。
- `docs/reference/lexical.md`：保留字加 `repeat`（见 R9 的完整表）。
- `docs/guide/introduction.md` 与 `examples.md` 的编译映射表：加一行
  `repeat N { } → 展开为 N 份直线代码`。

---

## R8 · 字符串转义

### 现状

转义规则未定义，无法输出字面 `$` 或 `"`。

### 改后规范文本 `[EN §lexical]`

````markdown
### String escapes

Inside a string literal the following escapes are recognised; any other `\x` is an error:

| Escape | Result                           |
| :----- | :------------------------------- |
| `\"`   | a literal double quote           |
| `\\`   | a literal backslash              |
| `\$`   | a literal `$` (no interpolation) |
| `\n`   | newline                          |
| `\t`   | tab                              |

A `$` is **not** special unless it is followed by an identifier character or `{`; `\$`
guarantees a literal dollar sign in all cases.

```simy
tellraw @s "cost: \$5"        // prints: cost: $5
tellraw @s "say \"hi\""       // prints: say "hi"
```
````

````

### 连带改动

- `docs/reference/lexical.md`：Literals 表下补转义表。
- `docs/reference/commands.md`：字符串插值一节补交叉引用。

---

## R9 · `at` 等 execute 动词降为上下文敏感

### 现状规范原文

> **Strictly reserved keywords (16)**: `let mut const fn if else elif while for in return execute at component true false`

### 问题

`at` 只在 `execute` 之后有意义，却被列为全局保留字。语言本身已为 `tick` / `return` / 类型名
采用"仅在特定位置才是关键字"的做法，`at` 没理由例外。一致性 + 少占用用户命名空间。

### 改后规范文本 `[EN §lexical]`

```markdown
**Strictly reserved keywords (16)** — cannot be used as variable or function names:

    let  mut  const  fn  if  else  elif  while  repeat  for  in  return  execute  component  true  false

**Context-sensitive words** — treated as keywords only in specific positions; elsewhere they
are ordinary identifiers:

| Word                                                                 | Recognised as a keyword                       | Elsewhere                |
| :------------------------------------------------------------------- | :-------------------------------------------- | :----------------------- |
| `tick`                                                               | Only inside a `component { }` body (method)   | Command name             |
| `return`                                                             | Inside `fn` bodies                            | Command (`return run …`) |
| `at`, `as`, `positioned`, `align`, `anchored`, `facing`, `rotated`, `store`, `run`, `unless` | Only as an `execute` verb (see Control Flow) | Command/identifier |
| `with`                                                               | Only as the command options introducer (R1)   | Identifier               |
| Type names (see Types)                                               | Only in type positions                        | Command name             |
````

> 注意保留字总数仍为 16：移除 `at`，新增 `repeat`。

### 连带改动

- `docs/reference/lexical.md`：关键词两节整体替换。
- `docs/reference/control-flow.md`：`execute` 动词表（同 R2）。

---

## R10 · 原始命令逃生舱

### 现状

`NBT` 有逃生舱，但 `execute` 是保留字，因此**无法书写任意原生 `execute` 链**（例如
`execute store result … run …`）。而游戏每个版本都在加 execute 子命令。

### 问题

与"NBT 保证不被新版本卡住"同一条理由，命令也必须有一个逃生舱，否则 DSL 会被版本卡住。

### 改后规范文本 `[EN §commands]`

````markdown
## The raw-command escape hatch

Text inside backticks is emitted as a single `mcfunction` line, **verbatim** — no
interpolation, no atom parsing:

```simy
`execute store result score #simy/tmp #simy/vars run data get entity @s Health`
```
````

- The content must be a single line and must not contain a backtick.
- Interpolation and variable references are **not** expanded inside backticks.
- Use this for command forms the structured grammar does not yet model, exactly as raw
  `nbt` covers fields the type system does not yet model.

````

### 连带改动

- `docs/reference/commands.md`：新增一节，紧邻「The NBT escape hatch」。
- `docs/guide/introduction.md`：编译映射表加一行（原样透传）。

---

## R11 · 谓词表达式 vs 值布尔（语义规范）

### 现状

类型系统有 `bool`，但没定义"能直接变成 `execute if` 的条件"与"存进 scoreboard 的 0/1"
是同一类表达式还是两类。

### 问题

不定义，就会出现"同一段布尔有时能写在 `if` 里、有时不能"，且生成的代码不可预测。

### 改后规范文本 `[EN §control-flow]`

```markdown
## Conditions: test expressions vs value booleans

A condition in `if` / `elif` / `unless` / `while` is a **test expression**. A test expression
lowers directly to `execute if` / `unless` clauses and never allocates storage:

| Form                                  | Lowering                                    |
| :------------------------------------ | :------------------------------------------ |
| `a <op> b` (nums / scores)            | `execute if score … matches …`              |
| `has_tag(e, "boss")`                  | `execute if entity e[tag=boss]`             |
| `exists(e)`                           | `execute if entity e`                       |
| `!cond`                               | `execute unless …`                          |
| `a && b`                              | chained `execute if … if …`                 |
| `a || b`                              | two run-lines: `if a` … , `unless a if b` … |

A boolean **bound with `let`** is a **value boolean**, lowered to a 0/1 scoreboard. Using it
as a condition is allowed and lowers to `execute if score <b> matches 1`.

```simy
if counter >= 100 { … }          // test expression, no storage
let mut done = false             // value boolean, stored as 0/1
if done { … }                    // → execute if score <done> matches 1
````

````

### 连带改动

- `docs/reference/control-flow.md`：新增「Conditions」一节。
- `docs/reference/variables-and-types.md`：`bool` 行补一句降级说明。
- `docs/reference/operators.md`：逻辑运算符补降低级对照。

---

## R12 · 区间表达式与 `in`

### 现状

selector 里用 `distance=..10` 这种字符串区间，但表达式层没有区间。

### 改后规范文本 `[EN §operators]`

```markdown
## Range expressions

A range describes a half-open or closed interval and is mostly used with `in`:

| Form        | Meaning              | Lowering                          |
| :---------- | :------------------- | :-------------------------------- |
| `a..b`      | `a <= x < b`         | `if score x matches a..b-1`       |
| `a..=b`     | `a <= x <= b`        | `if score x matches a..b`         |
| `a..`       | `x >= a`             | `if score x matches a..`          |
| `..b`       | `x < b`              | `if score x matches ..b-1`        |

```simy
if timer in 1..10 {
    …
}
````

````

### 连带改动

- `docs/reference/operators.md`：新增一节。
- `docs/reference/control-flow.md`：条件例子里用 `in`。

---

## R13 · 新增「消歧规则」附录页

建议新增 `docs/reference/disambiguation.md`（并在 `config.ts` 的 sidebar 注册），集中列出所有
"靠上下文或空白决定符号含义"的规则，一次讲清。初稿要点：

```markdown
# Disambiguation Rules

| Feature                    | How it is decided                                    |
| :------------------------- | :--------------------------------------------------- |
| `{ }`                      | Block, unless it follows `=` (map literal) or a command atom position (raw NBT) |
| `< >`                      | Generic parameters in type position; comparison in expression position |
| `( )` adjacent to an ident | Function call                                        |
| `( )` after whitespace      | Coordinate / vector atom only (R3)                  |
| `with(…)`                  | Command options block (R1)                          |
| `$name`                    | Variable reference in a command; interpolation inside a string |
| `scores.<obj>`             | User objective; everything else after `.` is a domain property (R5) |
````

---

## 待办 · P2 / P3（后续单独起草）

- **P2 float 定点**：精度、int32 溢出、乘除缩放、与 `num` 混算。
- **P2 字符串存储**：`str` 跨作用域 / 比较的降级（`data get` vs macro）。
- **P2 `for … in <selector>`**：快照语义 vs 实时语义（遍历中改 tag 的陷阱）。
- **P2 `return` 版本要求**：写明 mcfunction `return run` 需 **1.20.2+**，以及返回值跨函数的传递方式。
- **P2 `"$name"` 后接 CJK 需 `${}`**：CJK 不属于标识符字符集，本身能断开，建议复核是否可放宽。
- **P3 `summon Spirit(...)`**：把"命令 + 构造调用"这一隐藏特例显式化（`spawn` / `new`）。
- **P3 `break` / `continue`**：仅在有界循环（`repeat` / `for`）内。
- **P3 `match`**：暂缓。
- **P3 `_` 两义**：丢弃绑定 vs 未使用前缀，文档点明即可。

---

---

# P2 / P3 修订草案（续）

## R14 · `float` 定点（P2）

**规范文本 `[EN §variables-and-types]`**

```markdown
`float` is compiled to **fixed-point** with a scale factor of 1000: the value is stored in a
scoreboard multiplied by 1000 (`scale=0.001` converts it back for display and commands).

- A `float` is exact to three decimals.
- Scoreboards are 32-bit signed integers, so a float's range is bounded by ±2 147.483; constant
  overflow is a compile error, runtime overflow saturates.
- Mixing `num` and `float` scales the `num` operand up; the result stays `float`. Division runs
  on the scaled integers and truncates to the same three decimals.
```

**连带**：`variables-and-types.md` 的 `float` 行；`operators.md` 的除法说明。

## R15 · `str` 的存储与比较（P2）

**规范文本 `[EN §variables-and-types]`**

```markdown
A `str` never lives in a scoreboard. A bound `str` is stored in `storage` (`simy:vars`), and
operations on it lower accordingly:

| Operation     | Lowering                                           |
| :------------ | :------------------------------------------------- |
| equality `==` | `execute if data storage simy:vars {…}`            |
| interpolation | `data get` into a macro / `tellraw` text component |

`str` is **not** a first-class value for arithmetic or ordering — only equality and
interpolation are defined. Anything richer goes through the `nbt` escape hatch.
```

**连带**：`variables-and-types.md`；`commands.md` 的字符串内插小节。

## R16 · `for … in <selector>` 遍历语义（P2）

**规范文本 `[EN §control-flow]`**

```markdown
`for player in @a { … }` lowers to `execute as @a { … }`: the selector is re-evaluated at every
step rather than snapshotted. If the body changes what matches the selector — adding or removing
a tag, teleporting out of `distance=…` — iteration may skip entities or revisit them.

When the body must mutate the set, mark the loop set with a dedicated tag and clear it in a
single pass outside the loop, instead of mutating the selector's own condition.
```

**连带**：`control-flow.md` 的 `for … in` 小节。

## R17 · `return` 与最低版本（P2）

**规范文本 `[EN §functions]`**

```markdown
Returning a value relies on mcfunction `return run`, added in **Minecraft 1.20.2**, so Simy's
generated datapacks target **1.20.2+**.

A `fn` with a `-> T` return type lowers `return <expr>` to `return run …`; a caller receives the
value through `execute store result … run function simy:<name>`. A `fn` without a return type
emits no `return run` unless it returns early with a bare `return`.
```

**连带**：`functions.md`；`installation.md` 可补一句版本要求。

## R18 · 放宽 `"$name"` 后接 CJK 的限制（P2）

**结论**：可以放宽。CJK 不属于标识符字符集 `[A-Za-z0-9_]`，`$name` 的识别在遇到 CJK 时自然
结束，`"$name生命"` 无歧义地读作「变量 `name` 的值 + 字面文本 `生命`」。保留 `${ expr }`
仅用于嵌入任意表达式。

**规范文本 `[EN §commands]`**

```markdown
| Form        | Syntax      | When to use                                                                               |
| :---------- | :---------- | :---------------------------------------------------------------------------------------- |
| Short form  | `$name`     | Followed by any non-identifier character — punctuation, whitespace, CJK, or end of string |
| Braced form | `${ expr }` | When you need to embed an arbitrary expression                                            |
```

**连带**：`commands.md` 内插表；`lexical.md` 内插相关行。

## R19 · P3 备忘（不展开）

- `summon Spirit(…)`：建议显式化为 `spawn Spirit(…)` 或 `new Spirit(…)`，消除「命令 + 构造」的隐藏特例。
- `break` / `continue`：只允许出现在有界循环（`repeat` / `for`）内。
- `match`：暂缓；选择器 / 状态分派可先用 `elif` 链替代。
- `_` 两义（丢弃绑定 / 未使用前缀）：文档点明差异即可。

## R20 · `|>` 续行标记（已落地）

**动机**：单个命令时块形式太重，而且 `if` 子句无法竖排（行首 `if` 是控制流块）。`|>` 借鉴自
函数式语言与实验性语言 [Revo](https://revo.lung.fyi/) 的 pipes，但**含义变了**：在那些语言里
它是把值喂给函数的真运算符，在 Simy 里它只是续行标记（等价于空格），没有值管道。

**规范文本 `[EN §control-flow]`**

```markdown
An `execute` scope is a **chain** of verb clauses followed by exactly one action — a single
command, or a `{ }` block of several. Write it on one line with an optional `run` tail, stack
the clauses vertically with a leading `|>`, or use `{ }` for several commands.

- `|>` is a **line-continuation marker**: it carries no meaning and is equivalent to a space.
  It is valid only at the start of a line that continues a statement, and it is never `||`.
- A clause ends at the next verb keyword, `|>` , `{`, or end of line. The first segment that
  does not begin with a verb keyword is the action and must be last.
- `run` may introduce the action; it is optional but matches vanilla `execute … run`.
```

**连带改动（已完成）**：`control-flow.md`（EN+ZH）新增「链 / `run` / `|>` / 块」；`operators.md`
加「`|>` ≠ `||`」警告；`disambiguation.md`（EN+ZH）加行；`examples.md`（EN+ZH）示例加竖排；
`simy.ts` 加 `\|>`；`guide/design-principles.md` 与 `guide/why-rust-like.md`（EN+ZH，该页后来改名为
`syntax-origins.md`，见 R21）新增来源
说明（函数式语言 + Revo，含义已变）。

**待办**：`tree-sitter-simy` 需一条 `_line_continuation` 隐藏规则，并保证 `|>` 优先于 `|`。

---

## R21 · 隐式返回 + 「一切皆表达式」（已落地，方案 B）

**动机**：去掉 `return` 仪式感；借鉴 [Revo](https://revo.lung.fyi/)「一切皆表达式」。用户拍板选 **B**（值穿透控制流，`if` 成为表达式），且 **D2 报错**（无 `-> T` 却以值结尾 → 编译错误）。

**规范文本 `[EN §functions · §control-flow]`**

```markdown
A `{ }` block is an expression whose value is its last expression. `if` / `elif` / `else` are
expressions too: the whole construct evaluates to the value of the branch that ran, and all
branches must produce the same type (or produce nothing). `while` / `for … in` / `repeat` are
statements with no value.

A function that declares `-> T` returns its body's value automatically; a trailing `return` is
allowed but linted as redundant. `return` is for exiting early. A function without `-> T` returns
nothing: if its body ends in a value-producing expression, that is a compile error — add a return
type, or discard with `let _ = …`.

Statements are decided by leading form, not punctuation: `let` / `const` / assignment / `return` /
`while` / `for … in` / `repeat` / `execute …` / commands are statements (no value); everything else
is an expression.
```

**连带改动（已完成）**：`functions.md`、`control-flow.md`、`variables-and-types.md`、
`disambiguation.md`、`examples.md`（EN+ZH）；`guide/introduction.md` 与 `guide/design-principles.md`
提到借鉴 Revo；`guide/syntax-origins.md`（由 `why-rust-like.md` **改名**，不再过度强调 Rust，改为
「语法来源 + 与其他语言比较」），`config.ts` 侧栏与全部交叉引用同步。

**降级要点**：隐式返回是 AST 层语法糖，直接 desugar 成 `return <expr>`，复用 R17 的 `return run`；
`if` 作值需要临时结果槽，各分支写入同一槽（或各分支直接 `return`）。

**待办**：`tree-sitter-simy` 需允许 `if` 出现在表达式位；`simy-core` 需在类型检查阶段做**分支类型
合并**，并对「无 `-> T` 却以值结尾」报错。

---

## 建议的合并顺序

1. R9（关键词表）+ R13（消歧页）—— 一次改清全局规则。
2. R2 / R3 / R1 / R5 —— 符号与调用规则。
3. R4 / R8 / R12 —— 运算符与字面量。
4. R6 / R7 / R10 / R11 —— 新增语义与入口点（需同步改 `examples.md` / `introduction.md`）。
5. 全部落地后，同步 `docs/zh/reference/*` 镜像，并更新 `tree-sitter-simy` 与 `docs/.vitepress/simy.ts`。
