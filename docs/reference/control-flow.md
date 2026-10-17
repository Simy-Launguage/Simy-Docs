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
A line that begins with `|>` continues the previous statement (see
[the `execute` chain](#the-execute-context-scope)) — and it is the only convenient way to
start an `if` clause on its own line, since a bare `if` here is a control-flow block.
:::

### `if` as an expression

A `{ }` block is an expression whose value is its last expression, and `if` / `elif` / `else`
are expressions too: the whole construct evaluates to the value of the branch that ran. That
lets a branch ladder be used wherever a value is expected:

```simy
let label = if hp <= 0 { "dead" } else { "alive" }
```

All branches must produce the **same type** (or all produce nothing), otherwise it is a
compile error. Used as a statement — the common case — the value is simply discarded.

- `while`, `for … in` and `repeat` are **statements**: they have no value.
- A function body's value is returned when the function declares a return type — see
  [Implicit return](/reference/functions#implicit-return).

## Conditions: test expressions vs value booleans

A condition in `if` / `elif` / `unless` / `while` is a **test expression**. A test expression
lowers directly to `execute if` / `unless` clauses and never allocates storage:

| Form                       | Lowering                                        |
| :------------------------- | :---------------------------------------------- |
| `a <op> b` (nums / scores) | `execute if score … matches …`                  |
| `has_tag(e, "boss")`       | `execute if entity e[tag=boss]`                 |
| `exists(e)`                | `execute if entity e`                           |
| `!cond`                    | `execute unless …`                              |
| `a && b`                   | chained `execute if … if …`                     |
| `a \|\| b`                 | `execute if a …` plus `execute unless a if b …` |

A boolean **bound with `let`** is a **value boolean**, lowered to a 0/1 scoreboard; using it as
a condition lowers to `execute if score <b> matches 1`:

```simy
if counter >= 100 { … }   // test expression, no storage
let mut done = false      // value boolean, stored as 0/1
if done { … }             // → execute if score <done> matches 1
```

A range can be used with `in` — see [Operators](/reference/operators#range-expressions):

```simy
if timer in 1..10 {
    …
}
```

## `repeat` (bounded loop)

```simy
repeat 10 {
    particle minecraft:flame ~ ~1 ~
}
```

- The count must be a **compile-time constant integer** — an integer literal or a `const`.
- `repeat` unrolls to straight-line output: N copies of the body, no runtime recursion, no
  tick budget, guaranteed to terminate.
- A non-constant count is a compile error; use `while` for data-dependent repetition.

## `while`

```simy
while timer > 0 {
    timer -= 1
}
```

Because `mcfunction` has no loops, `while` is lowered to a **self-recursive generated
function** (`execute if <test> run function simy:loop_…`). Each iteration consumes a
command-chain step, bounded by the game's `maxCommandChainLength`, and a condition that never
becomes false will **hang the datapack**. Prefer `repeat` whenever the count is known.

## `for … in` (iterating a selector)

```simy
for player in @a[gamemode=adventure] {
    effect give $player minecraft:glowing 1 1
}
```

## `return`

The last expression of a function body is returned automatically (see
[Implicit return](/reference/functions#implicit-return)); `return` is for **leaving early**
— from the middle of a loop, or from one arm of an `if`:

```simy
fn pick(value: num) -> num {
    if value < 0 {
        return 0
    }
    value
}
```

> `return` is a **context-sensitive word**: inside a `fn` body it is a return statement; at
> the module top level it falls back to an ordinary identifier (so the `/return run …`
> command can be used).

## The `execute` context scope

Structured scopes replace native `execute` nesting. An `execute` scope is a **chain** of verb
clauses followed by exactly one action — a single command, or a `{ }` block of several:

```
execute <verb> <argument>… <action>
```

`execute` takes at least one clause from this list; clauses may be repeated and combined in any
order:

| Verb         | Argument          | Meaning                       |
| :----------- | :---------------- | :---------------------------- |
| `as`         | selector / entity | Run as the target             |
| `at`         | selector / entity | Run at the target's position  |
| `positioned` | pos               | Run at an absolute position   |
| `align`      | axes              | Round the position to axes    |
| `anchored`   | `eyes` / `feet`   | Move the anchor point         |
| `facing`     | pos / entity      | Face a position or entity     |
| `rotated`    | rotation          | Set the rotation              |
| `in`         | dimension         | Run in a dimension            |
| `if`         | test              | Run only when the test passes |
| `unless`     | test              | Run only when the test fails  |

A verb argument runs until the next verb keyword, `|>`, `{`, or the end of the line, so
multi-token arguments such as `positioned ~ ~1 ~` work without brackets.

### One action, on one line

`run` introduces a single trailing command. It is optional — the action is already
unambiguous — but it reads well and matches vanilla `execute … run`:

```simy
execute as @s at ~ ~1 ~ if score $timer matches 1..100 run title @s actionbar "tick"
```

### One action, stacked

A line beginning with `|>` continues the previous statement; `|>` is a **line-continuation
marker**, not an operator, and is equivalent to a space. Stacking is the only convenient way to
write an `if` clause on its own line, because a bare `if` at the start of a statement is a
control-flow block:

```simy
execute as @s
    |> at ~ ~1 ~
    |> if score $timer matches 1..100
    |> title @s actionbar "tick"
```

### Several actions

For more than one command, use a `{ }` block instead; it is lowered to a generated
sub-function:

```simy
execute at @a {
    particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
    particle minecraft:flame ~ ~1 ~
}
```

## Statement termination and scopes

| Statement type                                                             | Ending                                |
| :------------------------------------------------------------------------- | :------------------------------------ |
| `let` / `const` / assignment / expression / `return` / command             | **Terminated by a newline**           |
| `fn` / `component` / `if` / `for` / `while` / `execute` / bare `{ }` block | Compound statement, **no terminator** |

Blank lines are allowed between statements, and a line comment never needs a terminator of
its own. Newlines inside `( )`, `[ ]`, `< >` and `{ }` are ignored (implicit line joining),
so lists and arguments can wrap across lines. A line that begins with `|>` likewise continues
the previous statement. Scopes are delimited by `{ }`; declarations inside a nested block are
visible only there.

### Statements and expressions

Simy has no statement terminator, so "statement or expression?" is decided by the **leading
form**, never by punctuation:

| Leading form                                                        | Kind       | Value |
| :------------------------------------------------------------------ | :--------- | :---- |
| `let` / `const` / assignment / `return`                             | statement  | none  |
| `while` / `for … in` / `repeat` / `execute …` / a bare `{ }` block  | statement  | none  |
| a command (`effect give …`, `tellraw …`)                            | statement  | none  |
| everything else — literals, `a + b`, `f(x)`, `@a[..]`, `if … {}`, … | expression | yes   |

A block's value is its **last expression**; every earlier line is evaluated for effect and
discarded. That is why a trailing `return` is optional in a function.

```simy
fn apply(
    target: entity,
    amount: num,
) -> num {
    return amount * 2
}
```
