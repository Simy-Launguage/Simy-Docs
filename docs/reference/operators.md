# Operators

An **operator** is a symbol that combines values to produce a new value. The values it
works on are called **operands**, and something like `1 + 2` is an **expression**. You
will mostly meet operators inside `let`, assignments and the conditions of `if` / `while`.

This page lists every operator Simy supports, what it means in plain words, and how
operators bind together when several appear at once.

## Arithmetic operators

Used with numbers (`num` and `float`) to compute a new number.

| Operator | Name      | Meaning                                 | Example → result |
| :------- | :-------- | :-------------------------------------- | :--------------- |
| `+`      | Plus      | Add the two numbers                     | `3 + 2` → `5`    |
| `-`      | Minus     | Subtract the right number from the left | `5 - 2` → `3`    |
| `*`      | Times     | Multiply the two numbers                | `3 * 4` → `12`   |
| `/`      | Divide    | Divide the left number by the right     | `10 / 2` → `5`   |
| `%`      | Remainder | What is left over after dividing        | `7 % 2` → `1`    |

`%` (read as "remainder" or "modulo") gives the **leftover** after a division: `7 % 2`
is `1`, because 7 divided by 2 is 3 with 1 left over. It is handy for "do something every
N-th time":

```simy
if counter % 10 == 0 {
    tellraw @a "a multiple of ten"
}
```

::: info Integer semantics: round down first, then wrap
`num` lives on a 32-bit scoreboard, so arithmetic has two rules worth knowing:

- **`/` rounds down**, it does not truncate toward zero: `-7 / 2` is `-4`. `%` uses
  `Math.floorMod` (since 1.13.1), so the result takes the **divisor's** sign.
- **Overflow wraps**: going past the end does not error, it lands on the other end
  (`2³¹ − 1` plus 1 drops to `−2³¹`). An out-of-range literal or `const` is a
  **compile error**, while runtime values wrap exactly like Minecraft.

Ranges, coordinate limits and the fixed-point ceiling live in
[Numeric ranges and overflow](/reference/variables-and-types#numeric-ranges-and-overflow).
:::

## Comparison operators

These compare two values and produce a **boolean** — either `true` or `false`. That
result is exactly what `if` and `while` test.

| Operator | Name                     | Meaning                           | Example → result   |
| :------- | :----------------------- | :-------------------------------- | :----------------- |
| `==`     | Equal to                 | Are the two values the same?      | `1 == 1` → `true`  |
| `!=`     | Not equal to             | Are they different?               | `1 != 2` → `true`  |
| `<`      | Less than                | Is the left value smaller?        | `1 < 2` → `true`   |
| `>`      | Greater than             | Is the left value larger?         | `2 > 1` → `true`   |
| `<=`     | Less than or equal to    | Is the left smaller, or the same? | `2 <= 2` → `true`  |
| `>=`     | Greater than or equal to | Is the left larger, or the same?  | `1 >= 2` → `false` |

::: warning `=` is not `==`
`=` **stores** a value (`let x = 1`). `==` **asks a question** ("are these equal?") and
answers with `true` / `false`. Confusing the two is the most common beginner mistake.
:::

```simy
if counter >= 100 {
    tellraw @a "combo reached!"
}
```

::: info Two meanings of `!=`
Outside selectors, `!=` compares two values. Inside selector arguments it is also used
as "not equal" (e.g. `@e[type!=zombie]`) — see [Commands & Minecraft Atoms](/reference/commands).
:::

## Range expressions

A range describes an interval and is mostly used with `in`:

| Form    | Meaning       | Lowering                    |
| :------ | :------------ | :-------------------------- |
| `a..b`  | `a <= x < b`  | `if score x matches a..b-1` |
| `a..=b` | `a <= x <= b` | `if score x matches a..b`   |
| `a..`   | `x >= a`      | `if score x matches a..`    |
| `..b`   | `x < b`       | `if score x matches ..b-1`  |

```simy
if timer in 1..10 {
    …
}
```

## Logical operators

These combine booleans. `&&` and `||` are usually written between two conditions.

| Operator | Name | Meaning                                   | Example → result           |
| :------- | :--- | :---------------------------------------- | :------------------------- |
| `&&`     | AND  | `true` only when **both** sides are true  | `true && false` → `false`  |
| `\|\|`   | OR   | `true` when **at least one** side is true | `true \|\| false` → `true` |
| `!`      | NOT  | Reverses a boolean                        | `!true` → `false`          |

```simy
if counter > 0 && timer > 0 {
    timer -= 1
}
```

> `&&` and `||` are **short-circuiting**: the right-hand side is only evaluated when it
> can change the answer. In `a && b`, if `a` is already `false`, `b` is skipped; in
> `a || b`, if `a` is already `true`, `b` is skipped.

A condition built from these operators is a **test expression**: it lowers directly to
`execute if` / `unless` clauses and allocates no storage. A boolean stored in a variable is a
**value boolean** instead, held as a 0/1 scoreboard — see
[Control Flow & Scopes](/reference/control-flow#conditions-test-expressions-vs-value-booleans).

::: warning `|>` is not `||`
`|>` is not a logical operator. It is a line-continuation marker used to stack `execute`
clauses, and it is never the same as `||`.
:::

## Assignment operators

An assignment **stores** a value into a variable. The shorthand forms update the variable
in place; the variable must be declared `mut`.

| Operator | Name                 | Meaning                                    | Shorthand for |
| :------- | :------------------- | :----------------------------------------- | :------------ |
| `=`      | Assign               | Put the right-hand value into the variable | —             |
| `+=`     | Add and assign       | Increase the variable by the value         | `x = x + n`   |
| `-=`     | Subtract and assign  | Decrease the variable by the value         | `x = x - n`   |
| `*=`     | Multiply and assign  | Multiply the variable by the value         | `x = x * n`   |
| `/=`     | Divide and assign    | Divide the variable by the value           | `x = x / n`   |
| `%=`     | Remainder and assign | Replace the variable with the remainder    | `x = x % n`   |

```simy
let mut timer = 5
timer -= 1              // timer is now 4
@s.scores.combo += 1    // increase the combo score by one
```

## Member access and function calls

| Operator | Name          | Meaning                                   | Example                       |
| :------- | :------------ | :---------------------------------------- | :---------------------------- |
| `.`      | Member access | Read a property of a value                | `target.health`               |
| `()`     | Call          | Run a function, optionally with arguments | `distance_multiplier(victim)` |

`foo(a)` (with parentheses) is a **function call**, while `foo a b` (without) is a
**command** — see [Commands & Minecraft Atoms](/reference/commands).

## Unary operators

A **unary** operator applies to a single value on its right.

| Operator | Name     | Meaning                                   | Example |
| :------- | :------- | :---------------------------------------- | :------ |
| `-`      | Negate   | Flip the sign of a number                 | `-3`    |
| `+`      | Positive | Mark a number as positive (rarely needed) | `+3`    |
| `!`      | NOT      | Reverse a boolean                         | `!done` |

## Precedence and associativity

When an expression contains several operators, **precedence** decides which one is applied
first. **Associativity** decides how operators of the _same_ precedence are grouped.

From highest to lowest:

| Precedence  | Operators         | Meaning                       | Associativity   |
| :---------- | :---------------- | :---------------------------- | :-------------- |
| 1 (highest) | `.`               | member access                 | Left            |
| 2           | `()`              | call                          | Left            |
| 3           | `!` `-` `+`       | unary                         | Right           |
| 4           | `*` `/` `%`       | multiply / divide / remainder | Left            |
| 5           | `+` `-`           | add / subtract                | Left            |
| 6           | `<` `>` `<=` `>=` | comparison                    | Non-associative |
| 7           | `==` `!=`         | equality                      | Non-associative |
| 8           | `&&`              | AND                           | Left            |
| 9 (lowest)  | `\|\|`            | OR                            | Left            |

Because `*` ranks above `+`, this expression:

```simy
let total = 1 + 2 * 3
```

is `1 + (2 * 3) = 7`, **not** `(1 + 2) * 3 = 9`. When in doubt, use parentheses `( )` to
force the order you mean:

```simy
let total = (1 + 2) * 3   // 9
```

_Left_ associativity means operators of the same precedence group from the left: `a - b - c`
is `(a - b) - c`.
