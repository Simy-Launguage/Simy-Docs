---
layout: home

hero:
  name: Simy
  text: Minecraft 数据包 DSL
  tagline: Rust 风格的现代表层语法，忠实映射 scoreboard / NBT / execute 的现实，编译为 mcfunction 与 JSON。
  actions:
    - theme: brand
      text: 简介
      link: /zh/guide/introduction
    - theme: alt
      text: 语法参考
      link: /zh/reference/lexical

features:
  - icon: 🧬
    title: 默认不可变
    details: 无前缀即不可变；只有异常状态才显式写 mut，可变性一眼可见。
  - icon: 🎯
    title: 贴近 Minecraft 概念
    details: 实体、方块、物品、计分板与 storage 是一等类型，而非拼起来的字符串。
  - icon: 🧱
    title: 结构化替代嵌套 execute
    details: 用控制流与作用域块替代深层嵌套的 execute 链，底层仍然忠实映射。
  - icon: 🧩
    title: 组件
    details: 把状态（scoreboard / tag）与行为（tick）打包成可复用组件，用 summon 实例化。
  - icon: 🛟
    title: NBT 逃生舱
    details: 任何尚未抽象的东西都能以原始 NBT 传递，新版本 Minecraft 不会卡住你。
  - icon: ⚙️
    title: 可预测的编译
    details: 每个构造都有明确的降级方案：const 内联、不可变 let 折叠、mut 落到 scoreboard / storage。
---
