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

| Type    | Description                                     | Lowering                               | Literal examples |
| :------ | :---------------------------------------------- | :------------------------------------- | :--------------- |
| `num`   | 32-bit integer (scoreboard's native capability) | `scoreboard` (int)                     | `42`, `-3`       |
| `float` | Float (compiled to fixed-point, ×1024 scaling)  | `scoreboard` scaling / `storage` NBT   | `3.14`           |
| `bool`  | Boolean, compiled to 0/1                        | `scoreboard`                           | `true` / `false` |
| `str`   | String                                          | `storage` NBT / inlined into `tellraw` | `"hello"`        |

> `num` is the default numeric type because scoreboards are integers (32-bit ones — see
> [Numeric ranges and overflow](#numeric-ranges-and-overflow)). `float` is
> automatically scaled to fixed-point at compile time (multiplied by 1024 to store in a
> scoreboard, then converted back with `scale=0.0009765625`, i.e. 2⁻¹⁰), transparently to the
> user.

> `bool` has two roles at the semantic level: a boolean **bound with `let`** is a _value
> boolean_, stored as a 0/1 scoreboard, while an inline condition such as `counter >= 100` is
> a _test expression_, lowered straight to `execute if` with no storage. See
> [Control Flow & Scopes](/reference/control-flow#conditions-test-expressions-vs-value-booleans).

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
- An `if` / `elif` / `else` expression takes the **common type** of its branches; branches
  that disagree — or that mix a value with nothing — are a compile error.
- A function body's value must match its declared `-> T` (see
  [Implicit return](/reference/functions#implicit-return)).
- Complex structures going into `storage` need an explicit type annotation:

```simy
let scores: map<str, num> = { "kills": 0, "deaths": 0 }
```

## Numeric ranges and overflow

Integers are not unlimited in vanilla, and the **width depends on where the value lives** —
`num` lands on a scoreboard, so the scoreboard decides its range:

| Storage            | Underlying type           | Range                                                    |
| :----------------- | :------------------------ | :------------------------------------------------------- |
| Scoreboard (`num`) | 32-bit signed integer     | −2³¹ … 2³¹−1                                             |
| `storage` NBT      | byte / short / int / long | −2⁷…2⁷−1 / −2¹⁵…2¹⁵−1 / −2³¹…2³¹−1 / −2⁶³…2⁶³−1          |
| `pos`, `vec3`      | double (IEEE-754)         | in commands: x, z ∈ [−3×10⁷, 3×10⁷), y ∈ [−2×10⁷, 2×10⁷) |

The 2³¹ ceiling is vanilla behaviour, not a tunable; a `storage` long reaches 2⁶³, the largest
integer the game offers. `pos` / `vec3` are doubles — integers stay exact up to 2⁵³ — and the
coordinate bounds in the table are an extra limit on command arguments.

**Overflow wraps.** Scoreboard arithmetic stays inside 32 bits, and going past the end
**does not error** — it wraps, exactly like Java's `int`:

```simy
let mut hp = 2_147_483_647  // 2³¹ − 1, the scoreboard ceiling
hp += 1                     // → −2³¹: it wraps instead of erroring
```

Simy does not hide this, but it hoists whatever it can see at compile time: an
out-of-range **literal or `const` is a compile error**, while runtime values still wrap just
like Minecraft.

**Three semantics worth knowing.** Scoreboard operations lower straight to vanilla commands,
so they follow the game's definitions:

| Operation     | Semantics                      | Note                                       |
| :------------ | :----------------------------- | :----------------------------------------- |
| `a / b`       | **rounds down** (floor)        | not truncation toward zero: `-7 / 2 == -4` |
| `a % b`       | `Math.floorMod` (since 1.13.1) | the result takes the divisor's sign        |
| float → `num` | **rounds down** before storing | `-1.5` is stored as `-2`                   |

**Scale the fixed point with a power of two.** A `float` is ×1024 (2¹⁰) fixed point, so the
scoreboard's ±2³¹ first has to be divided by 2¹⁰:

- a single `float` reaches **±2²¹, about ±2.10×10⁶**;
- two `float`s multiplied together land at ×2²⁰ scaling, so `|a · b|` has to stay within
  **2¹¹ = 2048** or the intermediate result blows past 32 bits.

Multiplication therefore has to correct the scale explicitly (multiply, then `÷ 1024` — a
shift right by 10 — at the cost of the low bits).

**Need bigger integers?** Two routes:

- put them in a `storage` long (−2⁶³ … 2⁶³−1);
- or pair a "high word" and a "low word" scoreboard into one big number — the datapack
  community's usual trick, and `list<T>` / `map<k, v>` are a natural home for it.
