# Variables & Types

## Variables and mutability

```simy
let damage = 10                        // immutable (default, no prefix)
let mut timer = 0                      // mutable (mut prefix, immediately visible)
let target: entity = @e[type=creeper]  // type after name, omittable when inferable
const MAX_HEALTH = 20                  // compile-time constant, inlined, no scoreboard
```

**Mutability ratio strategy**: roughly 80% immutable (configuration, intermediate values)
and 20% mutable (timers, game state). Mutable variables must be marked `mut` explicitly
and declare where they are stored.

**Lowering at compile time**:

| Declaration     | Lowering                                  |
| :-------------- | :---------------------------------------- |
| `const`         | Inlined away; occupies no runtime storage |
| Immutable `let` | Constant folding / SSA                    |
| `mut`           | `scoreboard` / `storage`                  |

## Type system

Types come in three layers: **primitive types**, **Minecraft domain types** (first-class)
and **composite types**. All type names are **context-sensitive and not reserved** — they
only take effect in type positions, so commands such as `tag @s add foo` are unaffected.

### Primitive types

| Type    | Description                                         | Lowering                               | Literal examples |
| :------ | :-------------------------------------------------- | :------------------------------------- | :--------------- |
| `num`   | Integer (scoreboard's native capability)            | `scoreboard` (int)                     | `42`, `-3`       |
| `float` | Float (compiled to fixed-point, e.g. ×1000 scaling) | `scoreboard` scaling / `storage` NBT   | `3.14`           |
| `bool`  | Boolean, compiled to 0/1                            | `scoreboard`                           | `true` / `false` |
| `str`   | String                                              | `storage` NBT / inlined into `tellraw` | `"hello"`        |

> `num` is the default numeric type because scoreboards are integers. `float` is
> automatically scaled to fixed-point at compile time (e.g. multiplied by 1000 to store in
> a scoreboard, then converted back with `scale=0.001`), transparently to the user.

### Domain types (first-class)

| Type       | Description                                                            | Lowering                        | Literal examples                    |
| :--------- | :--------------------------------------------------------------------- | :------------------------------ | :---------------------------------- |
| `entity`   | A resolved concrete entity (readable properties, e.g. `target.health`) | Selector / UUID                 | `@a[distance=..10]`                 |
| `selector` | The selector expression itself (lazily evaluated)                      | Embedded verbatim into commands | `@e[type=zombie]`                   |
| `pos`      | Position (including `~` relative coordinates)                          | `storage` or inline             | `~ ~1 ~`, `(0, 64, 0)`              |
| `vec3`     | Vector (motion paired with `pos`)                                      | `storage`                       | `(0.5, 1.0, -0.2)`                  |
| `block`    | Block ID + block states                                                | Inline ID                       | `minecraft:chest[waterlogged=true]` |
| `item`     | Item ID + NBT / components                                             | Inline                          | `minecraft:diamond_sword`           |
| `team`     | Team                                                                   | Native `scoreboard`             | `"adventure"`                       |
| `tag`      | Tag                                                                    | Native `scoreboard`             | `"boss"`                            |
| `nbt`      | Escape hatch: arbitrary raw NBT                                        | `storage`, verbatim             | `{Health:10f}`                      |

> **`entity` vs `selector`**: `entity` is "a resolved concrete entity" (readable
> properties, passable as an argument); `selector` is "the selector expression itself"
> (lazily evaluated, passable into `execute`). This distinction lets the compiler optimize
> more aggressively.
>
> **The `nbt` escape hatch** guarantees the DSL is never blocked by fields added in a new
> Minecraft version — anything not yet abstracted can be passed through as raw NBT.

### Composite types

| Type               | Description                                                              | Lowering                                |
| :----------------- | :----------------------------------------------------------------------- | :-------------------------------------- |
| `list<T>`          | List                                                                     | `storage` NBT list                      |
| `map<k, v>`        | Map (e.g. `map<str, num>`)                                               | `storage` NBT compound                  |
| `option<T>`        | Nullable (pairs with future `?` propagation, "the entity may not exist") | `scoreboard` presence bit + value       |
| Component instance | User-defined component type (see [Components](/reference/components))    | `tag` + several `scoreboard` objectives |

### Type inference

- `let damage = 10` is inferred as `num`.
- Values crossing scoreboards default to `num`.
- Complex structures going into `storage` need an explicit type annotation:

```simy
let scores: map<str, num> = { "kills": 0, "deaths": 0 }
```
