# 示例与编译映射

## 完整示例

```simy
const MAX_HEALTH = 20

fn distance_multiplier(victim: entity) -> num {
    return 2
}

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

component Spirit(name: str, effect: str) {
    tick(entity self) {
        effect give $self $effect 1 1
    }
}

summon Spirit("Speed Spirit", "minecraft:speed")
@s.score += 1
tellraw @s "连击 x$comboCount!" (color: "red")
tellraw @s "总分：${comboCount * 10}"
```

## 编译映射概览

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
| 生成物命名            | `#simy/…`、`simy:…`                    |
