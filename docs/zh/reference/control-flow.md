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
`elif`、`else` 关键字与左花括号 `{` 必须与前面内容同行。
括号 `()`、`[]`、`<>`、`{}` 内的换行会被忽略（隐式续行），因此参数表、选择器参数等可以跨行书写。
:::

## `while`

```simy
while timer > 0 {
    timer -= 1
}
```

## `for … in`（遍历选择器）

```simy
for player in @a[gamemode=adventure] {
    effect give $player minecraft:glowing 1 1
}
```

## `return`

```simy
fn pick(value: num) -> num {
    if value < 0 {
        return 0
    }
    return value
}
```

> `return` 是**上下文识别字**：在 `fn` 体内它识别为返回语句；模块顶层回落为普通标识符
> （可调用 `/return run …` 命令）。

## `execute` 上下文作用域

用结构化作用域替代原生 `execute` 嵌套。作用域目标写在 `< … >` 中：

```simy
execute at <@a> {
    particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
}
```

- `at <目标>`：切换执行位置。
- 后续可扩展 `as`、`positioned`、`if`、`unless`、`align`、`facing` 等动词。

## 语句终止与作用域

| 语句类型                                                              | 结尾                     |
| :-------------------------------------------------------------------- | :----------------------- |
| `let` / `const` / 赋值 / 表达式 / `return` / 命令                     | **以换行结尾**           |
| `fn` / `component` / `if` / `for` / `while` / `execute` / 裸 `{ }` 块 | 复合语句，**无需终止符** |

语句之间允许空行，行注释本身也不需要终止符。`( )`、`[ ]`、`< >`、`{ }` 内的换行会被忽略（隐式续行），便于列表与参数跨行。作用域以 `{ }` 界定，嵌套块内声明仅在该块可见。

```simy
fn apply(
    target: entity,
    amount: num,
) -> num {
    return amount * 2
}
```
