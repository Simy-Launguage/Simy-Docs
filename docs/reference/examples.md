# Examples & Compilation

## Complete example

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
        tellraw @a "combo reached!"
    } else {
        tellraw @a "keep going"
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
tellraw @s "combo x$comboCount!" with(color: "red")
tellraw @s "total: ${comboCount * 10}"
```

## Compilation mapping overview

| Simy construct        | Compiled output                                            |
| :-------------------- | :--------------------------------------------------------- |
| `const`               | Inlined; no runtime storage                                |
| Immutable `let`       | Constant folding / SSA                                     |
| `mut` `let`           | `scoreboard` objective / `storage`                         |
| `float`               | Fixed-point scaling (×1024 + `scale=0.0009765625`)         |
| `if` / `else`         | `execute if …` branches (+ temporary when used as a value) |
| Implicit return       | `return run …`                                             |
| `for … in @a`         | `execute as …` + iteration                                 |
| `repeat N { }`        | Unrolled straight-line output                              |
| `execute at @a { }`   | `execute at …`                                             |
| `#[tick]` / `#[load]` | `data/minecraft/tags/function/{tick,load}.json`            |
| Command statement     | The corresponding `mcfunction` line                        |
| Raw `` `command` ``   | Verbatim `mcfunction` line                                 |
| `component`           | `tag` + several `scoreboard` objectives                    |
| Generated names       | `#simy/…`, `simy:…`                                        |
