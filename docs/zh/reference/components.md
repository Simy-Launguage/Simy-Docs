# 组件

组件将状态（`scoreboard` / `tag`）与行为（`tick`）打包：

```simy
component Spirit(name: str, effect: str) {
    tick(entity self) {
        effect give $self $effect 1 1
    }
}

summon Spirit("Speed Spirit", "minecraft:speed")
```

- `component` 名**强制 CamelCase**（见[命名与命名空间](/zh/reference/conventions)）。
- `tick` 方法名仅在组件体内识别；参数用 `entity self` 形式传入自身。
- 实例化用 `summon`（透传命令词，非关键字），跟随的 `Spirit("…", "…")` 是函数调用。

组件实例本身也是一种类型，降级为 `tag` + 多个 `scoreboard` 目标——见[编译映射](/zh/reference/examples#编译映射概览)。
