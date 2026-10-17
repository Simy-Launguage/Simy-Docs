# 函数

```simy
fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    baseDamage * distance_multiplier(victim)
}
```

- 返回类型用 `->` 标注；无返回类型时省略。
- 参数为 `name: Type` 形式，多个参数以 `,` 分隔。
- 函数体是 `{ }` 作用域块，**最后一个表达式的值即返回值**（见下）。
- **函数名强制 `snake_case`**（见[命名与命名空间](/zh/reference/conventions)）。

## 调用函数

**函数调用**是紧贴 `(` 的标识符，属于表达式；**命令**是命令头后接空白、再接结构化原子的语句：

```simy
calc_damage(victim)   // 函数调用
calc_damage victim    // 命令（头 `calc_damage` + 参数 `victim`）
```

二者靠结构区分，不靠猜：

- **紧贴**标识符的 `(` 恒为函数调用。
- 空白之后的 `(`，在命令参数位只能是坐标 / 向量原子——`(0, 64, 0)` 或 `(0.5, 1.0, -0.2)`。
  其他任何带括号的表达式都是语法错误。

```simy
tp @s (100, 64, 0)    // 命令，带括号的坐标原子
tp @s (x)             // 错误：带括号的表达式不是命令原子
```

> **格式化器规则**：格式化器不得在调用的标识符与其 `(` 之间插入空白。

命令形式见[命令与 Minecraft 原子](/zh/reference/commands)。

## 隐式返回

`{ }` 块是一个表达式，其值就是块内**最后一个表达式**。声明了返回类型的函数，函数体的值即返回值，
因此末尾通常不必写 `return`：

```simy
fn distance_multiplier(victim: entity) -> num {
    2
}

fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    baseDamage * distance_multiplier(victim)
}
```

`if` / `elif` / `else` 也会产生值，因此整条分支链都可以作为返回值——见
[`if` 作为表达式](/zh/reference/control-flow#if-作为表达式)。`return` 仍然保留给**提前退出**（见下节）。

::: info 无返回值
没有 `-> T` 的函数不返回值。若它的函数体以「会产生值的表达式」结尾，则是**编译错误**——要么给函数加上
返回类型，要么用 `let _ = …` 刻意丢弃这个值：

```simy
fn grant_and_log(target: entity) {
    let _ = grant_bonus(target)   // grant_bonus 返回 num，这里刻意丢弃
}
```

以**命令**结尾则没问题：命令语句不产生值。
:::

> **Lint。** 函数体最末尾的 `return` 可以写，但会被标记为冗余。

## 提前返回

`return` 会退出所在函数。在 `fn` 体内它是返回语句；在模块顶层则回落为普通标识符
（`/return run …` 命令仍可用）：

```simy
fn pick(value: num) -> num {
    if value < 0 {
        return 0
    }
    value
}
```

## 入口点

**属性**装饰紧随其后的声明，写作单独一行的 `#[name]`，紧贴被装饰项；`#` 不是标识符字符，
因此属性永远不会与用户名字冲突。

| 属性      | 含义                         | 生成资源                                 |
| :-------- | :--------------------------- | :--------------------------------------- |
| `#[tick]` | 每个游戏刻运行该函数         | `data/minecraft/tags/function/tick.json` |
| `#[load]` | 数据包（重新）加载时运行一次 | `data/minecraft/tags/function/load.json` |

被标注的函数不接受参数、无返回值。每个包最多一个 `#[tick]` 和一个 `#[load]` 函数，
重复声明视为编译错误。

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
