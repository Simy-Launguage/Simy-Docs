---
layout: home

hero:
  name: Simy
  text: Minecraft datapack DSL
  tagline: Modern, Rust-flavoured surface syntax over the reality of scoreboard / NBT / execute — compiling down to mcfunction and JSON.
  actions:
    - theme: brand
      text: Introduction
      link: /guide/introduction
    - theme: alt
      text: Syntax Reference
      link: /reference/lexical

features:
  - icon: 🧬
    title: Immutable by default
    details: No prefix means immutable; only the unusual state is spelled out with mut, so mutability is visible at a glance.
  - icon: 🎯
    title: Close to Minecraft
    details: Entities, blocks, items, scoreboards and storage are first-class domain types rather than strings glued together.
  - icon: 🧱
    title: Structured, not nested execute
    details: Control flow and scope blocks replace deeply nested execute chains, while still mapping faithfully underneath.
  - icon: 🧩
    title: Components
    details: Bundle state (scoreboard / tag) with behaviour (tick) into a reusable component, then instantiate it with summon.
  - icon: 🛟
    title: NBT escape hatch
    details: Anything not yet abstracted can pass through as raw NBT, so a new Minecraft version never blocks you.
  - icon: ⚙️
    title: Predictable compilation
    details: Every construct has a documented lowering — const is inlined, immutable let folds, mut becomes scoreboard / storage.
---
