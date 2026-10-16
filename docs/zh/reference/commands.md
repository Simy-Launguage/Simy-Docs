# 命令与 Minecraft 原子

## 命令语句

命令语句由**命令头**（任意标识符）与**若干结构化原子**组成，以换行结束：

```simy
effect give $player minecraft:glowing 1 1
tp $player ~ ~1 ~
tellraw @s "连击 x$comboCount!"
```

- 命令头**不是保留字**，任何标识符都可作命令名（含 `summon`、`effect`、`particle`……）。
- 参数可选的收尾命名参数块：`(key: value, …)`。

```simy
tellraw @s "连击 x$comboCount!" (color: "red")
```

- **区分调用与命令**：`foo(a)` 恒为函数调用；`foo a b` 恒为命令。

```
calc_damage(victim)                   // 函数调用
calc_damage victim                    // 命令（头 calc_damage + 参数 victim）
```

## 选择器

```
@a @e @p @r @s @n
```

带参数用 `[ ]`，参数为 `key=value` 或 `key!=value`：

```simy
@a[gamemode=adventure]
@e[type=zombie,distance=..10]
@e[type=creeper,name="Bob"]
@a[tag=boss]
```

## 坐标与向量

| 形式     | 示例                |
| :------- | :------------------ |
| 相对坐标 | `~ ~1 ~`、`~-2 ~ ~` |
| 局部坐标 | `^ ^1 ^2`           |
| 绝对坐标 | `(0, 64, 0)`        |
| 向量     | `(0.5, 1.0, -0.2)`  |

## 命名空间 ID / 方块 / 物品

```simy
minecraft:glowing
minecraft:chest[waterlogged=true]
minecraft:diamond_sword
```

## NBT 逃生舱

`{ … }` 中的内容原样透传：

```simy
data merge block ~ ~ ~ { Health:10f }
```

## 变量引用与字符串内插

### 命令上下文：裸引用

以 `$` 引导，靠空白自然截断：

```simy
effect give $player minecraft:glowing 1 1
tp $player ~ ~1 ~
```

### 字符串内插：两种形式

| 形式   | 语法        | 适用场景                                  |
| :----- | :---------- | :---------------------------------------- |
| 短形式 | `$name`     | 变量后紧跟标点 / 空白 / 结尾              |
| 花括号 | `${ expr }` | 变量后紧跟 CJK 字符，或需要嵌入任意表达式 |

```simy
tellraw @s "连击 x$comboCount!"          // 短形式：后面是标点，安全
tellraw @s "当前连击：${comboCount}"      // 花括号：后面紧跟 CJK
tellraw @s "总分：${comboCount * 10}"     // 花括号：内含任意表达式
tellraw @s "${a}${b}${c}"                 // 相邻插值，无歧义
```

### 成员访问

```simy
@s.score += 1
tellraw @a "HP: ${target.health}"
```
