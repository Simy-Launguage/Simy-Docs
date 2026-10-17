# Functions

```simy
fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    baseDamage * distance_multiplier(victim)
}
```

- The return type is marked with `->`; omit it when there is none.
- Parameters use the `name: Type` form, separated by `,`.
- The body is a `{ }` scope block whose **last expression is the return value** (see below).
- **Function names are forced to `snake_case`** (see [Naming & Namespaces](/reference/conventions)).

## Calling a function

A **function call** is an identifier immediately followed by `(`, and it is an expression;
a **command** is a statement whose head is an identifier followed by whitespace:

```simy
calc_damage(victim)   // function call
calc_damage victim    // command (head `calc_damage` + argument `victim`)
```

The two are distinguished by structure, not by guesswork:

- A `(` **directly adjacent** to an identifier is always a function call.
- A `(` **after whitespace**, in command-argument position, is only valid as a
  coordinate/vector atom — `(0, 64, 0)` or `(0.5, 1.0, -0.2)`. Any other parenthesised
  expression is a syntax error there.

```simy
tp @s (100, 64, 0)    // command, parenthesised coordinate atom
tp @s (x)             // error: a parenthesised expression is not a command atom
```

> **Formatter rule.** Formatters must not insert whitespace between a call's identifier and
> its `(`.

See [Commands & Minecraft Atoms](/reference/commands) for the command form.

## Implicit return

A `{ }` block is an expression, and its value is its **last expression**. A function that
declares a return type returns its body's value, so a trailing `return` is usually
unnecessary:

```simy
fn distance_multiplier(victim: entity) -> num {
    2
}

fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    baseDamage * distance_multiplier(victim)
}
```

`if` / `elif` / `else` also produce values, so an entire branch ladder can be the result —
see [`if` as an expression](/reference/control-flow#if-as-an-expression). `return` remains
for **exiting early** (next section).

::: info Returning nothing
A function without `-> T` returns nothing. If its body ends in an expression that produces a
value, that is a **compile error** — either give the function a return type, or discard the
value on purpose with `let _ = …`:

```simy
fn grant_and_log(target: entity) {
    let _ = grant_bonus(target)   // grant_bonus returns num, discarded on purpose
}
```

Ending in a **command** is fine: a command statement produces no value.
:::

> **Lint.** A `return` at the very end of a function body is allowed, but is flagged as
> redundant.

## Returning early

`return` exits the enclosing function. Inside a `fn` body it is a return statement; at
the module top level it falls back to an ordinary identifier (so the `/return run …`
command still works):

```simy
fn pick(value: num) -> num {
    if value < 0 {
        return 0
    }
    value
}
```

## Entry points

An **attribute** annotates the declaration that follows it. Attributes are written `#[name]`
on their own line directly above the item; `#` is not an identifier character, so attributes
can never collide with user names.

| Attribute | Meaning                                              | Emitted resource                         |
| :-------- | :--------------------------------------------------- | :--------------------------------------- |
| `#[tick]` | Run this function every game tick                    | `data/minecraft/tags/function/tick.json` |
| `#[load]` | Run this function once when the datapack is reloaded | `data/minecraft/tags/function/load.json` |

An annotated function takes no parameters and returns nothing. At most one `#[tick]` and one
`#[load]` function may exist per package; duplicates are a compile error.

```simy
#[tick]
fn tick_handler() {
    …
}

#[load]
fn setup() {
    scoreboard objectives add combo dummy
}
```
