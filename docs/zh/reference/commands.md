# 命令与 Minecraft 原子

## 命令语句

命令语句由**命令头**（任意标识符）与**若干结构化原子**组成，以换行结束：

```simy
effect give $player minecraft:glowing 1 1
tp $player ~ ~1 ~
tellraw @s "连击 x$comboCount!"
```

- 命令头**不是保留字**，任何标识符都可作命令名（含 `summon`、`effect`、`particle`……）。
- 命令语句可在末尾带一个**选项块**，由上下文识别字 `with` 引导：`with(key: value, …)`。它必须
  是行内最后一个元素；因为由关键字引导，其含义永不依赖空白。

```simy
tellraw @s "连击 x$comboCount!" with(color: "red")
```

- **区分调用与命令**：`foo(a)` 是函数调用；`foo a b` 是命令。紧贴标识符的 `(` 恒为调用；
  空白后的 `(` 只可能是坐标 / 向量原子——见[函数](/zh/reference/functions#调用函数)。

```
calc_damage(victim)                   // 函数调用
calc_damage victim                    // 命令（头 calc_damage + 参数 victim）
tp @s (100, 64, 0)                    // 带括号的坐标原子
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

## 原始命令逃生舱

反引号中的文本作为**单独一行** `mcfunction` **原样**输出——不做内插、不解析原子：

```simy
`execute store result score #simy/tmp #simy/vars run data get entity @s Health`
```

- 内容必须是单行，且不能包含反引号。
- 反引号内**不会**展开变量引用与内插。
- 用于结构化语法尚未建模的命令形式，正如原始 `nbt` 承载类型系统尚未建模的字段。

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

要打印字面量 `$`，写 `\$`——见[词法](/zh/reference/lexical#字符串转义)。

### 分数与成员访问

分数通过保留的伪属性 `scores` 访问，其字段是 objective 名——与 `target.health` 这类领域属性区分开：

```simy
@s.scores.combo += 1
tellraw @a "击杀：${@s.scores.kills}"
tellraw @a "HP: ${target.health}"
```

- `.scores.<objective>` 读写用户 objective；objective 是标识符，不是字符串。
- 生成的 objective（`#simy/…`）不是标识符，用户代码永远碰不到它们。
