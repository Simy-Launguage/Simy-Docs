# Control Flow & Scopes

Conditions are **bracket-free**; blocks are delimited by `{ }`. Structured control flow
replaces native `execute` nesting.

## `if` / `elif` / `else`

`if` runs a block when its condition is true. `elif` (short for "else if") tests another
condition when the earlier ones were false, and `else` runs when nothing matched:

```simy
if counter >= 100 {
    tellraw @a "combo reached!"
} elif counter >= 50 {
    tellraw @a "keep it up"
} else {
    tellraw @a "keep going"
}
```

Use `elif` instead of nesting an `if` inside an `else`. You can chain as many `elif` arms
as you need, and the whole ladder stays at a single indentation level.

::: info Line rules
`elif`, `else` and an opening `{` must stay on the same line as what precedes them.
Newlines are **ignored inside `()`, `[]`, `<>` and `{}`** (implicit line joining), so
argument lists, parameter lists and selector arguments can span multiple lines.
:::

## `while`

```simy
while timer > 0 {
    timer -= 1
}
```

## `for … in` (iterating a selector)

```simy
for player in @a[gamemode=adventure] {
    effect give $player minecraft:glowing 1 1
}
```

## `return`

```simy
fn pick(value: num) -> num {
    if value < 0 {
        return 0
    }
    return value
}
```

> `return` is a **context-sensitive word**: inside a `fn` body it is a return statement; at
> the module top level it falls back to an ordinary identifier (so the `/return run …`
> command can be used).

## The `execute` context scope

Structured scopes replace native `execute` nesting. The scope target is written between
`< … >`:

```simy
execute at <@a> {
    particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
}
```

- `at <target>`: switch the execution position.
- `as`, `positioned`, `if`, `unless`, `align`, `facing` and other verbs can be added later.

## Statement termination and scopes

| Statement type                                                             | Ending                                |
| :------------------------------------------------------------------------- | :------------------------------------ |
| `let` / `const` / assignment / expression / `return` / command             | **Terminated by a newline**           |
| `fn` / `component` / `if` / `for` / `while` / `execute` / bare `{ }` block | Compound statement, **no terminator** |

Blank lines are allowed between statements, and a line comment never needs a terminator of
its own. Newlines inside `( )`, `[ ]`, `< >` and `{ }` are ignored (implicit line joining),
so lists and arguments can wrap across lines. Scopes are delimited by `{ }`; declarations
inside a nested block are visible only there.

```simy
fn apply(
    target: entity,
    amount: num,
) -> num {
    return amount * 2
}
```
