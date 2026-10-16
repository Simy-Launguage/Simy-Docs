# Lexical Structure

## Comments

```simy
// line comment
/* block comment */
/** documentation comment */
```

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
let  mut  const  fn  if  else  elif  while  for  in  return  execute  at  component  true  false
```

**Context-sensitive words** — treated as keywords only in specific positions; elsewhere
they are ordinary identifiers:

| Word                                                     | Recognized as a keyword                                                                | Elsewhere                                    |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------------------------- |
| `tick`                                                   | Only inside a `component { }` body (method name)                                       | Command name (e.g. `/tick freeze`)           |
| `return`                                                 | A return statement inside `fn` bodies; falls back to a command at the module top level | Command name (`return run …`)                |
| Type names (see [Types](/reference/variables-and-types)) | Only in type positions                                                                 | Command name (e.g. `/tag`, `/team`, `/item`) |

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
