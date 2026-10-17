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
- A command statement may end with an optional **options block** introduced by the
  context-sensitive word `with`: `with(key: value, …)`. It must be the last element on the
  line. Because it is introduced by a keyword, its meaning never depends on whitespace.

```simy
tellraw @s "combo x$comboCount!" with(color: "red")
```

- **Calls vs commands**: `foo(a)` is a function call; `foo a b` is a command. A `(` directly
  adjacent to an identifier is always a call; a `(` after whitespace is only valid as a
  coordinate/vector atom — see [Functions](/reference/functions#calling-a-function).

```
calc_damage(victim)                   // function call
calc_damage victim                    // command (head calc_damage + argument victim)
tp @s (100, 64, 0)                    // parenthesised coordinate atom
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

## The raw-command escape hatch

Text inside backticks is emitted as a single `mcfunction` line, **verbatim** — no
interpolation, no atom parsing:

```simy
`execute store result score #simy/tmp #simy/vars run data get entity @s Health`
```

- The content must be a single line and must not contain a backtick.
- Variable references and interpolation are **not** expanded inside backticks.
- Use it for command forms the structured grammar does not yet model, exactly as raw `nbt`
  covers fields the type system does not yet model.

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

To print a literal `$`, write `\$` — see [Lexical Structure](/reference/lexical#string-escapes).

### Scores and member access

A score is reached through the reserved pseudo-property `scores`, whose field is an objective
name — distinct from a domain property such as `target.health`:

```simy
@s.scores.combo += 1
tellraw @a "kills: ${@s.scores.kills}"
tellraw @a "HP: ${target.health}"
```

- `.scores.<objective>` reads or writes a user objective; the objective is an identifier,
  never a string.
- Generated objectives (`#simy/…`) are not identifiers, so user code can never touch them by
  accident.
