# Design Principles

Simy is designed around five principles. They explain most of the surface-syntax
decisions you will meet in the [reference](/reference/lexical).

| Principle                                   | Description                                                                            |
| :------------------------------------------ | :------------------------------------------------------------------------------------- |
| **Immutable by default, mutation explicit** | No prefix means immutable; `mut` marks mutability so unusual state is visually flagged |
| **Less ceremony**                           | `fn`, bracket-free conditions, `const` folded at compile time                          |
| **Type after name**                         | `name: Type`, omittable when inferable                                                 |
| **Structured instead of nested `execute`**  | Control flow and scope blocks replace the native `execute` syntax                      |
| **Close to Minecraft concepts**             | Entities, blocks, items, scoreboards and storage are first-class                       |

## Immutable by default, mutation explicit

Most values in a datapack are configuration or intermediate results and never change.
Simy therefore treats them as immutable unless you ask otherwise:

```simy
let damage = 10      // immutable
let mut timer = 0    // mutable — needs a storage location
const MAX_HEALTH = 20
```

Roughly **80%** of bindings are expected to be immutable and **20%** mutable. Because
mutable bindings must declare where they live, the stateful part of a program stands
out when scanning code. See [Variables & Types](/reference/variables-and-types).

## Less ceremony

- `fn` and `component` are the only declaration keywords you need for code.
- Conditions are **bracket-free**; blocks are delimited by `{ }`.
- `const` is folded away entirely — it never occupies runtime storage.
- Statements end at the **newline** (Python-style) instead of a punctuation character.
- The last expression of a function body is its return value, so a trailing `return` is
  usually unnecessary.

## Type after name

Types are written _after_ the binding name and may be omitted when they can be inferred:

```simy
let target: entity = @e[type=creeper]
let damage = 10                  // inferred as num
```

See the [type system](/reference/variables-and-types).

## Structured instead of nested `execute`

Native datapack logic nests `execute` clauses, which is hard to read past a couple of
levels. Simy uses ordinary control flow (`if`, `for`, `while`, `repeat`) and a structured
`execute` chain written as a sequence of verb clauses:

```simy
execute at @a {
    particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
}
```

A chain can also be stacked vertically with `|>`, so it reads top to bottom. The notation is
borrowed from functional languages and [Revo](https://revo.lung.fyi/), but here `|>` is only a
line-continuation marker — not value piping (see
[Where the Syntax Comes From](/guide/syntax-origins)):

```simy
execute as @s
    |> at ~ ~1 ~
    |> if score $timer matches 1..100
    |> title @s actionbar "tick"
```

See [Control Flow & Scopes](/reference/control-flow).

## Close to Minecraft concepts

Entities, blocks, items, positions, teams, tags and raw NBT are **first-class types**,
not opaque strings. This lets the compiler reason about them and optimise more
aggressively, while `nbt` remains an escape hatch for anything not yet modelled.

::: tip Where does the syntax come from?
The surface borrows from several languages at once — Rust, Python, functional languages and
Minecraft itself — and drops the ceremony that only pays off in systems programming. See
[Where the Syntax Comes From](/guide/syntax-origins) for the full map.
:::
