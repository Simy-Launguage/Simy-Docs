# Why Simy Looks Like Rust

The first thing many people notice about Simy is that it looks like Rust. That raises an
obvious question, because Rust has a reputation for being _hard_, and Simy is meant to be
_easy_. This page explains what we borrowed, what we deliberately left behind, and why.

::: tip The short version
Simy borrows Rust's **surface syntax**, not its **memory model**. There is no ownership,
no borrowing and no lifetimes here — there is no memory to manage. What we wanted were
three properties that make code easy to read and hard to misread: **static strong typing**,
**types written after the name**, and **braces**.
:::

## It is not about memory safety

Rust's headline feature is memory safety without a garbage collector. Simy has nothing to
do with that:

- Simy compiles to `mcfunction` and JSON. There is no manual memory management and no
  allocator to reason about.
- A datapack runs _inside_ Minecraft; its "state" is scoreboard objectives and storage NBT,
  not pointers and buffers.
- So Simy has **no ownership rules, no borrow checker and no lifetime annotations**. The
  parts of Rust that most often scare beginners away are simply not here.

We copied the _shape_ of Rust code, not its safety machinery.

## Who these docs are for

Simy is a **domain-specific language** for making Minecraft datapacks. Its audience is map
makers, server admins, students and hobbyists — plenty of whom are **not professional
programmers**. A good DSL should lower the barrier to entry, not raise it, so the guiding
question behind every syntax decision was:

> Will this help a non-programmer read the code six months later?

Rust-like syntax wins on that test for three concrete reasons.

## What we actually borrowed

### 1. Static, strong typing

In a dynamic language, a bad selector is just a string until it fails at runtime — inside
Minecraft, often with an unhelpful message. Simy instead knows the difference between an
`entity`, a `pos` and a `str`, so the compiler can point at the line _before_ you ever
launch the game.

This matters even more for Minecraft, because its domain is full of genuinely different
kinds of values. See [Variables & Types](/reference/variables-and-types).

### 2. Type after name

Types are written _after_ the thing they describe:

```simy
let target: entity = @e[type=creeper]
let damage = 10
```

Read left to right it says "a `target`, which is an `entity`". The name you care about comes
first, and the type is a trailing label you can **omit** when it can be inferred. Beginners
get less to type; readers still get the information when it matters.

### 3. Braces and structure

`{ }` make scope boundaries visible and unambiguous:

```simy
if counter >= 100 {
    tellraw @a "combo reached!"
}
```

- The block's end is explicit — there is no indentation-only style to argue about, no
  tab-versus-space surprises, and pasting code never silently changes its meaning.
- Braces pair naturally with Rust's **structured control flow**, which is how Simy replaces
  deeply nested `execute` chains. See [Control Flow & Scopes](/reference/control-flow).

## Why not build on a Python-like syntax?

Python's syntax _is_ friendly, and we happily borrow from it. But using Python's _model_ as
the foundation for a Minecraft DSL creates friction in several places, and only one of them
is about types.

::: info What we do take from Python
Plenty — Python is right about a lot of things:

- `elif` instead of `else if` — shorter, and the whole branch ladder stays flat
- `for x in …` iteration
- plain `print`-style calls instead of a `println!` macro
- bracket-free conditions

We take Python's _surface_ ideas wherever they reduce effort. What we do not take is its
_model_ — dynamic typing and indentation-based blocks — for the reasons below.
:::

### The types do not fit

- **Python is dynamically typed.** An entity, a selector and a position would all just be
  strings. Nothing stops you from passing a position where an entity is expected.
- **Minecraft is full of domain types** — `entity`, `selector`, `pos`, `vec3`, `block`,
  `item`, `team`, `tag`, `nbt`. Modelling these as first-class types is what lets the
  compiler _check_ your code and _optimise_ it at the same time.
- **Annotations are optional and bolted on.** In Python they are hints; in Simy they are
  part of the language, so the tooling trusts them.

### Indentation is fragile

Python marks blocks with indentation alone. That reads nicely in a tidy file, but it makes
the invisible matter:

- **Invisible characters change meaning.** A stray tab, a mixed tab/space line, or — very
  common when typing with a CJK input method — a full-width space (`　`) or a full-width
  colon (`：`) silently changes or breaks the program, and the resulting error rarely points
  at the real cause.
- **Copy-paste is lossy.** Snippets shared in chat, on forums or in Discord routinely lose
  their leading whitespace, so pasted code stops doing what it did.
- **Deep nesting is invisible.** Past a few levels there is no closing token to anchor your
  eye, so you count spaces to find where a block ends.

Simy uses `{ }` instead: a block's end is explicit. And because the identifier character set
is fixed to ASCII, a full-width character becomes a clear error instead of a mystery.

### Tooling and error messages suffer

- **Indentation-sensitive grammars are harder to recover from.** The parser has to track
  indent/dedent separately, which makes error messages ("unexpected indent") and automatic
  fixing — exactly what a beginner leans on — harder to do well.
- **Dynamic typing weakens the editor.** Nothing can tell you that `@e[type=zombie]` is
  wrong where a number is expected; with Simy's types, the tooling can.
- **Explicit braces give formatters and linters an unambiguous structure to rewrite.**

### The language is bigger than the problem

Python is a general-purpose language: objects, classes, exceptions, imports, generators,
decorators, and so on. A datapack needs a small, predictable surface. A DSL should feel like
one page you can learn, not a language you have to grow into.

::: info Not a criticism of Python
None of this means Python is badly designed — it is tuned for generality and readability
across whole programs. The point is that those trade-offs do not pay off in a Minecraft DSL.
:::

In short: Python's simplicity is real, but it is tuned for Python's goals. For a datapack,
explicit braces and a real type system remove more confusion than they add.

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

That is the whole idea. Rust's braces, type-after-name and static typing give Simy a
regular, scannable shape; everything that exists purely to make a memory-safe systems
language work has been left out. If Rust were the goal we would have kept the hard parts —
we kept the parts that help a beginner.

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
