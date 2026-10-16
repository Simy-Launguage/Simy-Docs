# Introduction

> **Simy** is a DSL for **Minecraft datapack development**. It puts modern language
> ergonomics (Rust-like) on the surface while faithfully mapping the reality of
> `scoreboard` / `NBT` / `execute` underneath, compiling to `mcfunction` and JSON.
>
> This documentation describes the current Simy grammar (**v0.1**).

## Why Simy?

Minecraft datapacks are powerful but verbose: logic is expressed as deeply nested
`execute` chains, state lives in `scoreboard` objectives and `storage` NBT, and the
same intent is spread across `.mcfunction` files.

Simy keeps the semantics identical to what Minecraft actually runs, but gives you a
surface language with:

- **Immutable-by-default bindings** and explicit `mut` for stateful values.
- **Bracket-free conditions** and `{ }` blocks instead of nested `execute`.
- **A layered type system** with first-class Minecraft atoms (`entity`, `pos`, `item`, …).
- **Components** that package state and behaviour into one unit.
- **An NBT escape hatch** so nothing is ever blocked by a new game version.

::: tip New here?
Wondering how to get the compiler? The [installation guide](/guide/installation) walks through
the Rust toolchain and the `cargo install` step. Then read the
[Design Principles](/guide/design-principles) for the "why", and jump into the
[syntax reference](/reference/lexical) for the "how".
:::

## What it compiles to

Simy is a **source language**, not a runtime. A declaration is lowered at compile time:

| Simy construct        | Compiled output                                  |
| :-------------------- | :----------------------------------------------- |
| `const`               | Inlined; no runtime storage                      |
| Immutable `let`       | Constant folding / SSA                           |
| `mut` `let`           | `scoreboard` objective / `storage`               |
| `float`               | Fixed-point scaling (e.g. ×1000 + `scale=0.001`) |
| `if` / `else`         | `execute if …` branches                          |
| `for … in <selector>` | `execute as …` + iteration                       |
| `execute at <x> { }`  | `execute at …`                                   |
| Command statement     | The corresponding `mcfunction` line              |
| `component`           | `tag` + several `scoreboard` objectives          |

See [Examples & Compilation](/reference/examples) for the full mapping.

## Compiled, interpreted, or transpiled?

Simy is **neither compiled nor interpreted** in the usual sense. It has a real compilation
pipeline, but the output is not machine code — it is more source code: `mcfunction` and
JSON, which Minecraft itself reads and runs.

That makes Simy a **transpiler** (a source-to-source compiler): it translates one language
into another, and someone else does the executing.

| Question                    | Answer                                                                            |
| :-------------------------- | :-------------------------------------------------------------------------------- |
| Does Simy run my program?   | No. Simy never executes your code; it **produces** a datapack.                    |
| What actually executes?     | Minecraft's own datapack engine, running `mcfunction` and JSON.                   |
| When are mistakes caught?   | At **transpile time** — parsing, lint and type checks run before the game starts. |
| Is there a runtime or a VM? | No. There is no Simy interpreter in the loop.                                     |
| Can I read the result?      | Yes. The output is plain `.mcfunction` and JSON you can inspect and debug.        |

So the useful questions are not "compiled or interpreted?" but:

- **When do errors surface?** For Simy, before you launch the game — one of the main reasons
  for having a real front end (see [Why Simy Looks Like Rust](/guide/why-rust-like)).
- **What actually runs?** Vanilla Minecraft. What you ship is an ordinary datapack, so Simy
  output can sit next to hand-written functions and share the same tooling.

## A taste of Simy

```simy
const MAX_HEALTH = 20

fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    let damage = baseDamage * distance_multiplier(victim)
    return damage
}

fn tick_handler() {
    if counter >= 100 {
        tellraw @a "combo reached!"
    } else {
        tellraw @a "keep going"
    }

    for player in @a[gamemode=adventure] {
        effect give $player minecraft:glowing 1 1
    }

    execute at <@a> {
        particle minecraft:heart ~ ~1 ~ 0.5 0.5 0.5 0.1 10
    }
}
```

## How these docs are organised

- **Guide** — the motivation and the design principles behind the language.
- **Reference** — the normative grammar, split by topic:
  [Lexical Structure](/reference/lexical) ·
  [Variables & Types](/reference/variables-and-types) ·
  [Functions](/reference/functions) ·
  [Control Flow & Scopes](/reference/control-flow) ·
  [Commands & Minecraft Atoms](/reference/commands) ·
  [Operators](/reference/operators) ·
  [Components](/reference/components) ·
  [Naming & Namespaces](/reference/conventions).
- **Appendix** — [Examples & Compilation](/reference/examples).
