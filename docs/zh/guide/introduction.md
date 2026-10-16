# 简介

> **Simy** 是一门面向 **Minecraft 数据包开发** 的 DSL。表层采用现代语言工效学（Rust 风格），
> 底层忠实映射 `scoreboard` / `NBT` / `execute` 的现实，编译目标为 `mcfunction` 与 JSON。
>
> 这份文档描述 Simy 当前的语法规范（**v0.1**）。

## 为什么需要 Simy？

Minecraft 数据包很强大，但也很啰嗦：逻辑写成深层嵌套的 `execute` 链，状态散落在
`scoreboard` 目标与 `storage` NBT 中，同一个意图被拆到多个 `.mcfunction` 文件里。

Simy 保持语义与 Minecraft 实际执行的一致，但提供一门表层语言：

- **默认不可变的绑定**，状态值必须显式标 `mut`。
- **条件免括号**，用 `{ }` 块替代嵌套 `execute`。
- **分层类型系统**，Minecraft 原子（`entity`、`pos`、`item`……）是一等公民。
- **组件**，把状态与行为打包成一个单位。
- **NBT 逃生舱**，新游戏版本永远不会把你卡住。

::: tip 第一次来？
想知道怎么装编译器？[安装](/zh/guide/installation)一节讲了 Rust 工具链与 `cargo install`
的步骤。之后再先读[设计原则](/zh/guide/design-principles)了解「为什么」，进入[语法参考](/zh/reference/lexical)看「怎么写」。
:::

## 编译成什么

Simy 是**源语言**，不是运行时。每条声明都会在编译期降级：

| Simy 构造             | 编译产物                               |
| :-------------------- | :------------------------------------- |
| `const`               | 内联，无运行时存储                     |
| 不可变 `let`          | 常量折叠 / SSA                         |
| `mut` `let`           | `scoreboard` 目标 / `storage`          |
| `float`               | 定点数缩放（如 ×1000 + `scale=0.001`） |
| `if` / `else`         | `execute if …` 分支                    |
| `for … in <selector>` | `execute as …` + 迭代                  |
| `execute at <x> { }`  | `execute at …`                         |
| 命令语句              | 对应 `mcfunction` 行                   |
| `component`           | `tag` + 多个 `scoreboard` 目标         |

完整的映射见[示例与编译映射](/zh/reference/examples)。

## 编译型、解释型，还是转译型？

按通常的说法，Simy **既不是编译型，也不是解释型**。它确实有完整的编译流程，但产物不是机器码，而更接近「另一种源码」——`mcfunction` 和 JSON，由 Minecraft 自己去读取和执行。

所以更准确的说法是：Simy 是一门**转译型 DSL**（Transpiler / 源到源编译）——把一种语言翻译成另一种语言，执行交给别人。

| 问题                    | 回答                                                     |
| :---------------------- | :------------------------------------------------------- |
| Simy 会运行我的程序吗？ | 不会。Simy 从不执行你的代码，而是**产出**一个数据包。    |
| 真正在跑的是什么？      | Minecraft 自己的数据包引擎，执行 `mcfunction` 与 JSON。  |
| 出错什么时候被发现？    | **转译期**——解析、lint、类型检查都在启动游戏之前完成。   |
| 需要运行时或虚拟机吗？  | 不需要。整条链路里没有 Simy 解释器。                     |
| 产物能读吗？            | 能。输出是纯 `.mcfunction` 和 JSON，可以查看、可以调试。 |

所以更有用的问题不是「编译还是解释」，而是：

- **错误什么时候暴露？** 对 Simy 而言，是在启动游戏之前——这正是要有真正前端的原因之一（见[为什么 Simy 长得像 Rust](/zh/guide/why-rust-like)）。
- **真正运行的是什么？** 原版 Minecraft。你交付的是一个普通数据包，因此 Simy 的产物可以和手写函数并存，共用同一套工具链。

## 先睹为快

```simy
const MAX_HEALTH = 20

fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    let damage = baseDamage * distance_multiplier(victim)
    return damage
}

fn tick_handler() {
    if counter >= 100 {
        tellraw @a "连击达标！"
    } else {
        tellraw @a "继续加油"
    }

    for player in @a[gamemode=adventure] {
        effect give $player minecraft:glowing 1 1
    }

    execute at <@a> {
        particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
    }
}
```

## 文档结构

- **指南** —— 语言背后的动机与设计原则。
- **参考** —— 规范化语法，按主题拆分：
  [词法](/zh/reference/lexical) ·
  [变量与类型](/zh/reference/variables-and-types) ·
  [函数](/zh/reference/functions) ·
  [控制流与作用域](/zh/reference/control-flow) ·
  [命令与 Minecraft 原子](/zh/reference/commands) ·
  [运算符](/zh/reference/operators) ·
  [组件](/zh/reference/components) ·
  [命名与命名空间](/zh/reference/conventions)。
- **附录** —— [示例与编译映射](/zh/reference/examples)。
