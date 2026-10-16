# Functions

```simy
fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    let damage = baseDamage * distance_multiplier(victim)
    return damage
}
```

- The return type is marked with `->`; omit it when there is none.
- Parameters use the `name: Type` form, separated by `,`.
- The body is a `{ }` scope block.
- **Function names are forced to `snake_case`** (see [Naming & Namespaces](/reference/conventions)).

## Calling a function

`foo(a)` is always a function call, whereas `foo a b` is always a command — the presence
of parentheses is what distinguishes the two:

```simy
calc_damage(victim)   // function call
calc_damage victim    // command (head `calc_damage` + argument `victim`)
```

See [Commands & Minecraft Atoms](/reference/commands) for the command form.

## Returning early

`return` exits the enclosing function. Inside a `fn` body it is a return statement; at
the module top level it falls back to an ordinary identifier (so the `/return run …`
command still works):

```simy
fn pick(value: num) -> num {
    if value < 0 {
        return 0
    }
    return value
}
```
