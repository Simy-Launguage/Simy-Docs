# 示例与编译映射

## 完整示例

```simy
const MAX_HEALTH = 20

fn distance_multiplier(victim: entity) -> num {
    2
}

fn hp_label(hp: num) -> str {
    if hp <= 0 { "dead" } else { "alive" }
}

fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    baseDamage * distance_multiplier(victim)
}

#[tick]
fn tick_handler() {
    if counter >= 100 {
        tellraw @a "连击达标！"
    } else {
        tellraw @a "继续加油"
    }

    for player in @a[gamemode=adventure] {
        effect give $player minecraft:glowing 1 1
    }

    execute at @a {
        particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
    }

    execute as @s
        |> at ~ ~1 ~
        |> if score $timer matches 1..100
        |> title @s actionbar "tick"
}

component Spirit(name: str, effect: str) {
    tick(entity self) {
        effect give $self $effect 1 1
    }
}

summon Spirit("Speed Spirit", "minecraft:speed")
@s.scores.combo += 1
tellraw @s "连击 x$comboCount!" with(color: "red")
tellraw @s "总分：${comboCount * 10}"
```

## 编译映射概览

| Simy 构造             | 编译产物                                        |
| :-------------------- | :---------------------------------------------- |
| `const`               | 内联，无运行时存储                              |
| 不可变 `let`          | 常量折叠 / SSA                                  |
| `mut` `let`           | `scoreboard` 目标 / `storage`                   |
| `float`               | 定点数缩放（×1024 + `scale=0.0009765625`）      |
| `if` / `else`         | `execute if …` 分支（作值使用时另加临时变量）   |
| 隐式返回              | `return run …`                                  |
| `for … in @a`         | `execute as …` + 迭代                           |
| `repeat N { }`        | 展开为直线代码                                  |
| `execute at @a { }`   | `execute at …`                                  |
| `#[tick]` / `#[load]` | `data/minecraft/tags/function/{tick,load}.json` |
| 命令语句              | 对应 `mcfunction` 行                            |
| 原始 `` `命令` ``     | 原样 `mcfunction` 行                            |
| `component`           | `tag` + 多个 `scoreboard` 目标                  |
| 生成物命名            | `#simy/…`、`simy:…`                             |
