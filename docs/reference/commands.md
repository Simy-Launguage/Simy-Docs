# Commands & Minecraft Atoms

## Command statements

A command statement consists of a **command head** (any identifier) and **several
structured atoms**, terminated by a newline:

```simy
effect give $player minecraft:glowing 1 1
tp $player ~ ~1 ~
tellraw @s "combo x$comboCount!"
```

- The command head is **not reserved**; any identifier can be a command name (including
  `summon`, `effect`, `particle`, …).
- Arguments may end with an optional named-argument block: `(key: value, …)`.

```simy
tellraw @s "combo x$comboCount!" (color: "red")
```

- **Calls vs commands**: `foo(a)` is always a function call; `foo a b` is always a command.

```
calc_damage(victim)                   // function call
calc_damage victim                    // command (head calc_damage + argument victim)
```

## Selectors

```
@a @e @p @r @s @n
```

Arguments go in `[ ]` as `key=value` or `key!=value`:

```simy
@a[gamemode=adventure]
@e[type=zombie,distance=..10]
@e[type=creeper,name="Bob"]
@a[tag=boss]
```

## Coordinates and vectors

| Form                 | Examples            |
| :------------------- | :------------------ |
| Relative coordinates | `~ ~1 ~`, `~-2 ~ ~` |
| Local coordinates    | `^ ^1 ^2`           |
| Absolute coordinates | `(0, 64, 0)`        |
| Vectors              | `(0.5, 1.0, -0.2)`  |

## Namespaced IDs / blocks / items

```simy
minecraft:glowing
minecraft:chest[waterlogged=true]
minecraft:diamond_sword
```

## The NBT escape hatch

Whatever is inside `{ … }` is passed through verbatim:

```simy
data merge block ~ ~ ~ { Health:10f }
```

## Variable references and string interpolation

### Command context: bare references

Introduced by `$`, terminated naturally by whitespace:

```simy
effect give $player minecraft:glowing 1 1
tp $player ~ ~1 ~
```

### String interpolation: two forms

| Form        | Syntax      | When to use                                                                                           |
| :---------- | :---------- | :---------------------------------------------------------------------------------------------------- |
| Short form  | `$name`     | The variable is followed by punctuation / whitespace / end of string                                  |
| Braced form | `${ expr }` | The variable is immediately followed by a CJK character, or you need to embed an arbitrary expression |

```simy
tellraw @s "combo x$comboCount!"          // short form: followed by punctuation, safe
tellraw @s "current: ${comboCount}"        // braced: immediately followed by CJK
tellraw @s "total: ${comboCount * 10}"     // braced: contains an arbitrary expression
tellraw @s "${a}${b}${c}"                  // adjacent interpolations, unambiguous
```

### Member access

```simy
@s.score += 1
tellraw @a "HP: ${target.health}"
```
