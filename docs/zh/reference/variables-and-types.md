# 变量与类型

## 变量与可变性

```simy
let damage = 10                        // 不可变（默认，无前缀）
let mut timer = 0                      // 可变（mut 前缀，一眼可见）
let target: entity = @e[type=creeper]  // 类型后置，可推断时省略
const MAX_HEALTH = 20                  // 编译期常量，直接内联，不占计分板
```

**可变性比例策略**：不可变约 80%（配置、中间值），可变约 20%（计时器、游戏状态）。
可变变量必须显式写 `mut`，并声明其存储位置。

**编译层降级**：

| 声明         | 降级                         |
| :----------- | :--------------------------- |
| `const`      | 内联消失，不占任何运行时存储 |
| 不可变 `let` | 常量折叠 / SSA 优化          |
| `mut`        | `scoreboard` / `storage`     |

## 类型系统

类型分三层：**基础类型**、**Minecraft 领域类型**（一等公民）、**复合类型**。
所有类型名均**上下文识别、不保留**——它们只在类型位置生效，故 `tag @s add foo` 等命令不受影响。

### 基础类型

| 类型    | 说明                                | 底层映射                          | 字面量示例       |
| :------ | :---------------------------------- | :-------------------------------- | :--------------- |
| `num`   | 整数（计分板原生能力）              | `scoreboard` (int)                | `42`、`-3`       |
| `float` | 浮点（编译为定点数，如 ×1000 缩放） | `scoreboard` 缩放 / `storage` NBT | `3.14`           |
| `bool`  | 布尔，编译为 0/1                    | `scoreboard`                      | `true` / `false` |
| `str`   | 字符串                              | `storage` NBT / `tellraw` 内联    | `"hello"`        |

> `num` 是默认数字类型，因为计分板是整数。`float` 在编译期自动做定点数缩放
> （如乘 1000 存入 scoreboard，再用 `scale=0.001` 换算），用户无感知。

### 领域类型（一等公民）

| 类型       | 说明                                         | 底层映射          | 字面量示例                          |
| :--------- | :------------------------------------------- | :---------------- | :---------------------------------- |
| `entity`   | 已解析的具体实体（可读属性 `target.health`） | 选择器 / UUID     | `@a[distance=..10]`                 |
| `selector` | 选择器表达式本身（延迟求值）                 | 原样嵌入命令      | `@e[type=zombie]`                   |
| `pos`      | 坐标（含 `~` 相对坐标）                      | `storage` 或内联  | `~ ~1 ~`、`(0, 64, 0)`              |
| `vec3`     | 向量（与 `pos` 配合的运动量）                | `storage`         | `(0.5, 1.0, -0.2)`                  |
| `block`    | 方块 ID + 方块状态                           | 内联 ID           | `minecraft:chest[waterlogged=true]` |
| `item`     | 物品 ID + NBT / 组件                         | 内联              | `minecraft:diamond_sword`           |
| `team`     | 队伍                                         | `scoreboard` 原生 | `"adventure"`                       |
| `tag`      | 标签                                         | `scoreboard` 原生 | `"boss"`                            |
| `nbt`      | 逃生舱：任意原始 NBT                         | `storage` 原样    | `{Health:10f}`                      |

> **`entity` vs `selector`**：`entity` 表示“已解析的具体实体”（可读属性、可传参）；
> `selector` 是“选择器表达式本身”（延迟求值，可传入 `execute`）。这个区分让编译器能做更激进的优化。
>
> **`nbt` 逃生舱**：保证 DSL 永远不会被 MC 新版本的新字段卡住——任何无法抽象的东西都能以原始 NBT 传递。

### 复合类型

| 类型        | 说明                                                     | 底层映射                  |
| :---------- | :------------------------------------------------------- | :------------------------ |
| `list<T>`   | 列表                                                     | `storage` NBT list        |
| `map<k, v>` | 映射（如 `map<str, num>`）                               | `storage` NBT compound    |
| `option<T>` | 可空（配合未来 `?` 传播，“实体可能不存在”）              | `scoreboard` 存在位 + 值  |
| 组件实例    | 用户定义的组件类型（见[组件](/zh/reference/components)） | `tag` + 多个 `scoreboard` |

### 类型推断

- `let damage = 10` 自动推断为 `num`。
- 跨 scoreboard 的值默认 `num`。
- 进 `storage` 的复杂结构需要显式类型注解：

```simy
let scores: map<str, num> = { "kills": 0, "deaths": 0 }
```
