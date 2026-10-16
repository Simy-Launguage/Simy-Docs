# Components

A component bundles state (`scoreboard` / `tag`) with behaviour (`tick`):

```simy
component Spirit(name: str, effect: str) {
    tick(entity self) {
        effect give $self $effect 1 1
    }
}

summon Spirit("Speed Spirit", "minecraft:speed")
```

- Component names are **forced to CamelCase** (see [Naming & Namespaces](/reference/conventions)).
- The `tick` method name is recognized only inside a component body; its parameter passes
  `self` using the `entity self` form.
- Instantiation uses `summon` (a passthrough command word, not a keyword); the following
  `Spirit("…", "…")` is a function call.

A component instance is itself a type, lowered to a `tag` plus several `scoreboard`
objectives — see the [compilation mapping](/reference/examples#compilation-mapping-overview).
