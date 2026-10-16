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

## Type after name

Types are written _after_ the binding name and may be omitted when they can be inferred:

```simy
let target: entity = @e[type=creeper]
let damage = 10                  // inferred as num
```

See the [type system](/reference/variables-and-types).

## Structured instead of nested `execute`

Native datapack logic nests `execute` clauses, which is hard to read past a couple of
levels. Simy uses ordinary control flow (`if`, `for`, `while`) and a structured
`execute` scope whose target is written between `< … >`:

```simy
execute at <@a> {
    particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
}
```

See [Control Flow & Scopes](/reference/control-flow).

## Close to Minecraft concepts

Entities, blocks, items, positions, teams, tags and raw NBT are **first-class types**,
not opaque strings. This lets the compiler reason about them and optimise more
aggressively, while `nbt` remains an escape hatch for anything not yet modelled.

::: tip Curious about the Rust connection?
The surface syntax deliberately borrows from Rust. If you have ever wondered why — and
what we threw away — read [Why Simy Looks Like Rust](/guide/why-rust-like).
:::
