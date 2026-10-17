# Where the Syntax Comes From

Simy did not grow out of one language. Every part of its surface was picked from somewhere
else, because Simy is a **domain-specific language** for Minecraft datapacks — not a
general-purpose language — and a good DSL should be easy to read and hard to misread.

This chapter maps each part of the surface to where it came from, and says what we
deliberately left behind. It is not a defence of any single language; it is a tour of the
trade-offs.

::: tip The short version
We borrow **surface ideas** from several languages at once — Rust's braces, `fn` and static
typing; Python's `elif` and `for … in`; the expression-oriented style of functional
languages and [Revo](https://revo.lung.fyi/) — and we use Minecraft's own vocabulary for
everything that is actually a Minecraft concept.
:::

## A map of the surface

| Simy feature                                                                   | Comes from                                |
| :----------------------------------------------------------------------------- | :---------------------------------------- |
| `{ }` blocks, `fn`, `mut`, `->`, `//` comments                                 | Rust                                      |
| Static typing with the type written **after** the name                         | Rust                                      |
| `component` (state + behaviour in one unit)                                    | Rust's `struct` + `impl`, flattened       |
| `elif` instead of `else if`                                                    | Python                                    |
| `for x in …` iteration                                                         | Python                                    |
| `print`-style calls, no macros                                                 | Python                                    |
| Bracket-free conditions                                                        | Python                                    |
| Blocks and `if` **produce values**; a function's last expression is its result | functional languages / Revo               |
| `\|>` to stack `execute` clauses                                               | functional pipes / Revo (meaning changed) |
| Immutable by default                                                           | Rust and functional languages             |
| `@a`, `~ ~1 ~`, `scoreboard`, `storage`, NBT                                   | Minecraft itself                          |
| `entity`, `pos`, `block`, `item`, … as first-class types                       | Minecraft itself                          |

## What we take from Rust

Rust left the deepest mark, so it is worth being precise about which parts — and which
parts we left out. Simy borrows Rust's **surface syntax**, never its **memory model**:
there is no ownership, no borrowing and no lifetimes here, because there is no memory to
manage. A datapack's "state" is scoreboard objectives and storage NBT, not pointers and
buffers.

### 1. Static, strong typing

In a dynamic language, a bad selector is just a string until it fails at runtime — inside
Minecraft, often with an unhelpful message. Simy instead knows the difference between an
`entity`, a `pos` and a `str`, so the compiler can point at the line _before_ you ever
launch the game. See [Variables & Types](/reference/variables-and-types).

There is a quieter benefit too: **new types are cheap to add**. Types are declared in one
place and interpreted by the compiler, so introducing a new concept — something a new
Minecraft version brings, or a shape we want to abstract ourselves — is a single entry in
the type table: the compiler then checks and optimises it everywhere, with no call sites to
touch and no silent fallback to a string. And type names are **context-sensitive and not
reserved**, so a new name never collides with an existing command.

### 2. Type after name

Types are written _after_ the thing they describe:

```simy
let target: entity = @e[type=creeper]
let damage = 10
```

Read left to right it says "a `target`, which is an `entity`". The name you care about comes
first, and the type is a trailing label you can **omit** when it can be inferred.

### 3. Braces and structure

`{ }` make scope boundaries visible and unambiguous, and they pair naturally with the
structured control flow that replaces deeply nested `execute` chains:

```simy
if counter >= 100 {
    tellraw @a "combo reached!"
}
```

The price of an indentation-only style — mixed tabs and spaces, full-width characters, a
paste that loses leading whitespace — is covered in the next section, alongside Python's
indentation model.

## What we take from Python

Python's syntax _is_ friendly, and we borrow from it freely — we just do not build on its
**model**. On the surface we take exactly what the map above lists: `elif`, `for x in …`,
plain `print`-style calls and bracket-free conditions. The `elif` pays off most — shorter
than `else if`, and the whole branch ladder stays at one level.

What we do not take is that **model** — dynamic typing and indentation-based blocks:

- **The types do not fit.** An entity, a selector and a position would all just be strings;
  nothing stops you from passing a position where an entity is expected. Minecraft is full
  of genuinely different domain types, and modelling them as first-class types is what lets
  the compiler _check_ your code and _optimise_ it at the same time.
- **Indentation is fragile.** A stray tab, a mixed tab/space line, or — very common when
  typing with a CJK input method — a full-width space (`　`) or colon (`：`) silently
  changes or breaks the program, and the error rarely points at the real cause. Braces are
  explicit, and because the identifier character set is fixed to ASCII, a full-width
  character becomes a clear error instead of a mystery.
- **Copy-paste is lossy.** Snippets shared in chat, on a forum or in Discord routinely lose
  their leading whitespace, so pasted code stops doing what it did.
- **The language is bigger than the problem.** Python carries objects, classes, exceptions,
  imports, generators and decorators. A datapack needs a small, predictable surface — one
  page you can learn, not a language you grow into.

::: info Not a criticism of Python
None of this means Python is badly designed — it is tuned for generality and readability
across whole programs. Those trade-offs simply do not pay off in a Minecraft DSL.
:::

## What we take from functional languages and Revo

Two ideas come from the functional tradition — and, more recently, from
[Revo](https://revo.lung.fyi/), an experimental dynamic language "made for the joy of
programming" in which **everything is an expression**.

### Blocks and `if` produce values

A `{ }` block is an expression whose value is its last expression, and `if` / `elif` / `else`
produce the value of the branch that runs:

```simy
let label = if hp <= 0 { "dead" } else { "alive" }
```

A function that declares a return type returns its body's value, so a trailing `return` is
usually unnecessary:

```simy
fn distance_multiplier(victim: entity) -> num {
    2
}
```

`return` is kept for **exiting early**, not for the normal path. See
[Functions](/reference/functions#implicit-return).

### `|>` for stacking `execute` clauses

```simy
execute as @s
    |> at ~ ~1 ~
    |> if score $timer matches 1..100
    |> title @s actionbar "tick"
```

Here the borrow is **surface only**. In functional languages and in Revo, `|>` is a real
operator that feeds a value into the function on the right. In Simy it is a
**line-continuation marker**: it carries no meaning, is equivalent to a space, and exists so
an `execute` clause such as `if` can start its own line. There is no value-piping — see
[Control Flow & Scopes](/reference/control-flow#the-execute-context-scope).

## What we take from Minecraft itself

The largest vocabulary in Simy is not borrowed from a programming language at all — it is
Minecraft's own:

- **Commands** keep their familiar shape: `effect give $player minecraft:glowing 1 1`.
- **Selectors and coordinates** are written as-is (`@a[gamemode=adventure]`, `~ ~1 ~`), and
  **`scoreboard`, `storage` and NBT** are the real storage model, not hidden behind an
  abstraction the game does not have.
- **Domain types** — `entity`, `selector`, `pos`, `vec3`, `block`, `item`, `team`, `tag`,
  `nbt` — are first-class.

A `nbt` escape hatch guarantees the DSL is never blocked by a field added in a new Minecraft
version: anything not yet abstracted can be passed through as raw NBT.

## If you already know another language

| Idea                | Rust                         | Python                 | Kotlin                          | Simy                            |
| :------------------ | :--------------------------- | :--------------------- | :------------------------------ | :------------------------------ |
| Blocks              | `{ }`                        | indentation            | `{ }`                           | `{ }`                           |
| Statement end       | `;`                          | newline                | newline (`;` optional)          | newline                         |
| Variables           | `let`, immutable by default  | `x = …`, mutable       | `val` (immutable) / `var`       | `let`, immutable by default     |
| Types               | checked, after the name      | hints only             | checked, after the name         | checked, after the name         |
| Return              | `return`, or last expression | `return`               | `return`, or an expression body | `return`, or last expression    |
| `if` yields a value | yes                          | no (it is a statement) | yes                             | **yes**                         |
| Missing value       | `null` / `Option`            | `None`                 | `null` / `T?`                   | `option<T>`                     |
| Loops               | `for` / `while` / `loop`     | `for` / `while`        | `for` / `while`                 | `repeat` / `while` / `for … in` |

## What we deliberately cut from Rust

Copying Rust wholesale would defeat the purpose. Because Simy is only a DSL, we kept the
regularity and dropped the ceremony:

| Rust                                                     | Simy                                                       | Why                                                                |
| :------------------------------------------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------- |
| `println!(…)` macro + format string + formatting options | a plain Python-style `print` call, **no argument options** | Printing a value shouldn't require learning macros or format specs |
| `else if` for a multi-branch ladder                      | `elif` (**borrowed from Python**)                          | Shorter, and every branch stays at one indentation level           |
| `;` at the end of every statement                        | statements end at the **newline**                          | One less punctuation rule to remember; one statement per line      |
| Ownership, borrowing, lifetimes                          | removed entirely                                           | There is no memory to manage                                       |
| `struct` + `impl` + `trait`                              | `component` (state + behaviour)                            | Only the shape Minecraft actually needs                            |
| Macros (`!`)                                             | none                                                       | No metaprogramming to learn                                        |
| `pub`, `mod`, `use`, crates                              | not needed                                                 | A datapack is a flat file layout with a generated namespace        |
| Generics everywhere                                      | only `list<T>`, `map<k, v>`, `option<T>`                   | Enough for real data, not a type-system puzzle                     |
| `match`, enums, closures, iterators                      | not included (yet)                                         | Keep the surface small                                             |

## The rule we follow

> **Keep the structure that makes code readable; drop the ceremony that only pays off in
> systems programming.**

Rust gives the shape, functional languages and Revo the expression-oriented style, Python
the small ergonomic touches, and Minecraft the vocabulary. Everything that exists purely to
make a memory-safe systems language work has been left out.

## See also

- [Design Principles](/guide/design-principles) — the five principles behind the language.
- [Variables & Types](/reference/variables-and-types) — how Minecraft's domain types are
  modelled.
- [Operators](/reference/operators) — a plain-language tour of the symbols.

## DSLs are everywhere

It is tempting to measure a language by how _much_ it can express. Simy deliberately does
the opposite — and it is in good company. Some of the most influential languages in
computing are not general-purpose at all:

- **HTML** describes documents.
- **SQL** queries databases.
- **Excel formulas** compute a spreadsheet.
- **CSS** styles the web.
- **Regular expressions** match text.
- **Makefile / Dockerfile / .gitignore** configure tools.

Each one is small, focused, and deliberately **not** Turing-complete — and each one opened
up an entire domain to people who are not professional programmers. A DSL is not a lesser
general-purpose language; it is a different tool, and often the better one for its job.
Simy is proud to be one of them.

> 📖 Want the bigger picture? This Chinese article looks at how much DSLs have shaped the
> history of programming:
> [知乎专栏 · DSL 在编程发展中的重要性](https://zhuanlan.zhihu.com/p/2032094420758177236)
