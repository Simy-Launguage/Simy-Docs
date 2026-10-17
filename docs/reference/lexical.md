# Lexical Structure

## Comments

```simy
// line comment
/* block comment */
/** documentation comment */
```

`#[…]` is **not** a comment — it is an [attribute](/reference/functions#entry-points) that
annotates the declaration below it. Because `#` is not an identifier character, an attribute
can never collide with an ordinary name.

## Identifiers

The character set is fixed to **ASCII**, and identifiers may not start with a digit:

```
[A-Za-z_][A-Za-z0-9_]*
```

- A **single `_`** is a **discard binding**, meaning "deliberately ignored".
- A **`_` prefix** (e.g. `_unused`) is allowed — a **lint-level convention**, not a
  grammatical feature.

```simy
let _ = compute()        // discard the return value
let _cache = 1           // lint convention: marked unused, still an ordinary variable
```

## Keywords and reserved words

**Strictly reserved keywords (16)** — cannot be used as variable or function names:

```
let  mut  const  fn  if  else  elif  while  repeat  for  in  return  execute  component  true  false
```

**Context-sensitive words** — treated as keywords only in specific positions; elsewhere
they are ordinary identifiers:

| Word                                                                                | Recognized as a keyword                                                                | Elsewhere                                    |
| :---------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------------------------- |
| `tick`                                                                              | Only inside a `component { }` body (method name)                                       | Command name (e.g. `/tick freeze`)           |
| `return`                                                                            | A return statement inside `fn` bodies; falls back to a command at the module top level | Command name (`return run …`)                |
| `at` `as` `positioned` `align` `anchored` `facing` `rotated` `store` `run` `unless` | Only as an `execute` verb (see [Control Flow](/reference/control-flow))                | Command name or ordinary identifier          |
| `with`                                                                              | Only as the [command options](/reference/commands#command-options) introducer          | Ordinary identifier                          |
| Type names (see [Types](/reference/variables-and-types))                            | Only in type positions                                                                 | Command name (e.g. `/tag`, `/team`, `/item`) |

**Passthrough command words are not reserved** — `effect`, `give`, `particle`, `tellraw`,
`tp`, `summon`, `data`, etc. are all ordinary identifiers used directly as a command head.
There is no need to declare a keyword per command.

## Literals

| Literal           | Examples                           |
| :---------------- | :--------------------------------- |
| Integer           | `42`, `-3`                         |
| Fixed-point float | `3.14`, `0.5`                      |
| Boolean           | `true`, `false`                    |
| String            | `"hello"`, `"combo x$comboCount!"` |

### String escapes

Inside a string literal these escapes are recognised; any other `\x` is an error:

| Escape | Result                           |
| :----- | :------------------------------- |
| `\"`   | a literal double quote           |
| `\\`   | a literal backslash              |
| `\$`   | a literal `$` (no interpolation) |
| `\n`   | newline                          |
| `\t`   | tab                              |

A `$` is not special unless it is followed by an identifier character or `{`; `\$` guarantees
a literal dollar sign in every case.

```simy
tellraw @s "cost: \$5"    // prints: cost: $5
tellraw @s "say \"hi\""   // prints: say "hi"
```
