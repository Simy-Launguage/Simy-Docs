# Introduction

> **Simy** is a DSL for **Minecraft datapack development**. It puts modern language
> ergonomics on the surface — static types, braces and an expression-oriented style borrowed
> from several languages — while faithfully mapping the reality of `scoreboard` / `NBT` /
> `execute` underneath, compiling to `mcfunction` and JSON.
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
- **Everything is an expression**: blocks and `if` produce values, and a function body's
  last expression is its result — a design borrowed from the experimental language
  [Revo](https://revo.lung.fyi/).
- **A layered type system** with first-class Minecraft atoms (`entity`, `pos`, `item`, …).
- **Components** that package state and behaviour into one unit.
- **An NBT escape hatch** so nothing is ever blocked by a new game version.

::: tip New here?
Wondering how to get the compiler? The [installation guide](/guide/installation) covers both
routes: no-install channels for everyday use, and building from source with Cargo. Then read
the
[Design Principles](/guide/design-principles) for the "why", and jump into the
[syntax reference](/reference/lexical) for the "how".
:::

## What it compiles to

Simy is a **source language**, not a runtime. A declaration is lowered at compile time:

| Simy construct        | Compiled output                                    |
| :-------------------- | :------------------------------------------------- |
| `const`               | Inlined; no runtime storage                        |
| Immutable `let`       | Constant folding / SSA                             |
| `mut` `let`           | `scoreboard` objective / `storage`                 |
| `float`               | Fixed-point scaling (×1024 + `scale=0.0009765625`) |
| `if` / `else`         | `execute if …` branches                            |
| Implicit return       | `return run …`                                     |
| `for … in @a`         | `execute as …` + iteration                         |
| `repeat N { }`        | Unrolled straight-line output                      |
| `execute at @a { }`   | `execute at …`                                     |
| `#[tick]` / `#[load]` | `data/minecraft/tags/function/{tick,load}.json`    |
| Command statement     | The corresponding `mcfunction` line                |
| `component`           | `tag` + several `scoreboard` objectives            |

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
  for having a real front end (see [Where the Syntax Comes From](/guide/syntax-origins)).
- **What actually runs?** Vanilla Minecraft. What you ship is an ordinary datapack, so Simy
  output can sit next to hand-written functions and share the same tooling.

## A taste of Simy

```simy
const MAX_HEALTH = 20

fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    baseDamage * distance_multiplier(victim)
}

#[tick]
fn tick_handler() {
    if counter >= 100 {
        tellraw @a "combo reached!"
    } else {
        tellraw @a "keep going"
    }

    for player in @a[gamemode=adventure] {
        effect give $player minecraft:glowing 1 1
    }

    execute at @a {
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
  [Naming & Namespaces](/reference/conventions) ·
  [Disambiguation](/reference/disambiguation).
- **Appendix** — [Examples & Compilation](/reference/examples).
