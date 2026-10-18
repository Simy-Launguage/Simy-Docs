# 控制流与作用域

条件**免括号**，块以 `{ }` 界定。结构化控制流替代原生 `execute` 嵌套。

## `if` / `elif` / `else`

`if` 在条件为真时执行代码块；`elif`（"else if" 的缩写）在之前的条件都不成立时再判断一个条件；`else` 则在所有条件都不成立时执行：

```simy
if counter >= 100 {
    tellraw @a "连击达标！"
} elif counter >= 50 {
    tellraw @a "再接再厉"
} else {
    tellraw @a "继续加油"
}
```

用 `elif` 代替把 `if` 嵌进 `else { }`：可以串联任意多个 `elif` 分支，整条分支链始终保持在同一个缩进层级。

::: info 换行规则
所有带 `{ }` 体的构造——`if` / `elif` / `else`、`while`、`for … in`、`repeat`、`execute`、
`fn`、`component` 以及裸 `{ }` 块——左花括号 `{` 必须紧跟在其头部的**同一行末尾**，不能另起一行：

```simy
// 正确
if counter >= 100 {
    …
}

// 错误：行首的 `{` 会开始一条新的裸块语句
if counter >= 100
{
    …
}
```

换行是语句分隔符，因此控制流头部与 `{` 之间不能断行；格式化器也必须保持这一形式。
括号 `()`、`[]`、`<>`、`{}` 内的换行会被忽略（隐式续行），因此参数表、选择器参数等可以跨行书写。
以 `|>` 开头的行延续上一条语句（见 [`execute` 链](#execute-上下文作用域)）——而且这也是唯一能让
`if` 子句单独起一行的办法，因为此处行首的 `if` 是控制流块。
:::

### `if` 作为表达式

`{ }` 块是一个表达式，其值为块内最后一个表达式；`if` / `elif` / `else` 同样是表达式：整个结构
的值就是实际执行的那个分支的值。于是分支链可以直接用在需要值的位置：

```simy
let label = if hp <= 0 { "dead" } else { "alive" }
```

所有分支必须产生**相同的类型**（或者都不产生值），否则视为编译错误。当作语句使用时——也就是最常见的
情况——这个值直接被丢弃。

- `while`、`for … in`、`repeat` 是**语句**：不产生值。
- 函数体声明了返回类型时，函数体的值即返回值——见[隐式返回](/zh/reference/functions#隐式返回)。

## 条件：测试表达式与值布尔

`if` / `elif` / `unless` / `while` 的条件是一个**测试表达式**，直接降级为 `execute if` /
`unless` 子句，不分配任何存储：

| 形式                     | 降级                                          |
| :----------------------- | :-------------------------------------------- |
| `a <op> b`（num / 分数） | `execute if score … matches …`                |
| `has_tag(e, "boss")`     | `execute if entity e[tag=boss]`               |
| `exists(e)`              | `execute if entity e`                         |
| `!cond`                  | `execute unless …`                            |
| `a && b`                 | 串联 `execute if … if …`                      |
| `a \|\| b`               | `execute if a …` 加 `execute unless a if b …` |

用 `let` **绑定**的布尔是**值布尔**，存为 0/1 计分板；把它当条件使用时降级为
`execute if score <b> matches 1`：

```simy
if counter >= 100 { … }   // 测试表达式，无存储
let mut done = false      // 值布尔，存为 0/1
if done { … }             // → execute if score <done> matches 1
```

区间可配合 `in` 使用——见[运算符](/zh/reference/operators#区间表达式)：

```simy
if timer in 1..10 {
    …
}
```

## `repeat`（有界循环）

```simy
repeat 10 {
    particle minecraft:flame ~ ~1 ~
}
```

- 次数必须是**编译期常量整数**——整数字面量或 `const`。
- `repeat` 展开为直线代码：N 份循环体，无运行时递归、不消耗指令链预算，保证终止。
- 次数不是编译期常量会报错；数据相关的重复请用 `while`。

## `while`

```simy
while timer > 0 {
    timer -= 1
}
```

因为 `mcfunction` 没有循环，`while` 会降级为**自递归的生成函数**
（`execute if <test> run function simy:loop_…`）。每次迭代消耗一个指令链步数，上限受游戏的
`maxCommandChainLength` 约束；条件永远不为假会**卡死数据包**。次数已知时请优先用 `repeat`。

## `for … in`（遍历选择器）

```simy
for player in @a[gamemode=adventure] {
    effect give $player minecraft:glowing 1 1
}
```

## `return`

函数体的最后一个表达式会自动返回（见[隐式返回](/zh/reference/functions#隐式返回)）；`return` 用于
**提前离开**——从循环中途，或从 `if` 的某个分支：

```simy
fn pick(value: num) -> num {
    if value < 0 {
        return 0
    }
    value
}
```

> `return` 是**上下文识别字**：在 `fn` 体内它识别为返回语句；模块顶层回落为普通标识符
> （可调用 `/return run …` 命令）。

## `execute` 上下文作用域

用结构化作用域替代原生 `execute` 嵌套。一个 `execute` 作用域是一条**链**：若干动词子句，后接
恰好一个动作——单条命令，或 `{ }` 块里的多条命令：

```
execute <动词> <参数>… <动作>
```

`execute` 后至少跟下面一个子句；子句可重复、可任意组合：

| 动词         | 参数              | 含义               |
| :----------- | :---------------- | :----------------- |
| `as`         | selector / entity | 以目标身份执行     |
| `at`         | selector / entity | 以目标位置执行     |
| `positioned` | pos               | 以绝对坐标执行     |
| `align`      | axes              | 将坐标对齐到轴网格 |
| `anchored`   | `eyes` / `feet`   | 移动锚点           |
| `facing`     | pos / entity      | 面向坐标或实体     |
| `rotated`    | rotation          | 设置朝向           |
| `in`         | dimension         | 在某个维度执行     |
| `if`         | test              | 条件成立时执行     |
| `unless`     | test              | 条件不成立时执行   |

动词参数一直读到下一个动词关键字、`|>`、`{` 或行尾，因此 `positioned ~ ~1 ~` 这类多 token
参数无需括号。

### 单条命令 · 单行

`run` 引出末尾的单条命令。它可省略——动作本身已经无歧义——但读起来更清楚，也与原生
`execute … run` 一致：

```simy
execute as @s at ~ ~1 ~ if score $timer matches 1..100 run title @s actionbar "tick"
```

### 单条命令 · 竖排

以 `|>` 开头的行延续上一条语句；`|>` 是**续行标记**，不是运算符，等价于一个空格。竖排是让
`if` 子句单独起一行的唯一方便写法，因为语句开头的 `if` 是控制流块：

```simy
execute as @s
    |> at ~ ~1 ~
    |> if score $timer matches 1..100
    |> title @s actionbar "tick"
```

### 多条命令

需要多条命令时改用 `{ }` 块；它会降级为一个生成的子函数：

```simy
execute at @a {
    particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
    particle minecraft:flame ~ ~1 ~
}
```

## 语句终止与作用域

| 语句类型                                                              | 结尾                     |
| :-------------------------------------------------------------------- | :----------------------- |
| `let` / `const` / 赋值 / 表达式 / `return` / 命令                     | **以换行结尾**           |
| `fn` / `component` / `if` / `for` / `while` / `execute` / 裸 `{ }` 块 | 复合语句，**无需终止符** |

语句之间允许空行，行注释本身也不需要终止符。`( )`、`[ ]`、`< >`、`{ }` 内的换行会被忽略（隐式续行），便于列表与参数跨行。以 `|>` 开头的行同样延续上一条语句。作用域以 `{ }` 界定，嵌套块内声明仅在该块可见。

### 语句与表达式

Simy 没有语句终止符，所以「是语句还是表达式」由**行首形式**决定，绝不靠标点：

| 行首形式                                                    | 类别   | 是否产生值 |
| :---------------------------------------------------------- | :----- | :--------- |
| `let` / `const` / 赋值 / `return`                           | 语句   | 否         |
| `while` / `for … in` / `repeat` / `execute …` / 裸 `{ }` 块 | 语句   | 否         |
| 命令（`effect give …`、`tellraw …`）                        | 语句   | 否         |
| 其余——字面量、`a + b`、`f(x)`、`@a[..]`、`if … {}`……        | 表达式 | 是         |

块的值是它的**最后一个表达式**；更早的每一行都只为副作用求值、随后丢弃。这正是函数末尾的 `return`
可以省略的原因。

```simy
fn apply(
    target: entity,
    amount: num,
) -> num {
    return amount * 2
}
```
