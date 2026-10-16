# Examples & Compilation

## Complete example

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
        tellraw @a "combo reached!"
    } else {
        tellraw @a "keep going"
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
tellraw @s "combo x$comboCount!" (color: "red")
tellraw @s "total: ${comboCount * 10}"
```

## Compilation mapping overview

| Simy construct        | Compiled output                                  |
| :-------------------- | :----------------------------------------------- |
| `const`               | Inlined; no runtime storage                      |
| Immutable `let`       | Constant folding / SSA                           |
| `mut` `let`           | `scoreboard` objective / `storage`               |
| `float`               | Fixed-point scaling (e.g. ×1000 + `scale=0.001`) |
| `if` / `else`         | `execute if …` branches                          |
| `for … in <selector>` | `execute as …` + iteration                       |
| `execute at <x> { }`  | `execute at …`                                   |
| Command statement     | The corresponding `mcfunction` line              |
| `component`           | `tag` + several `scoreboard` objectives          |
| Generated names       | `#simy/…`, `simy:…`                              |
