# Disambiguation Rules

Simy reuses a few symbols across contexts. This page collects, in one place, every rule that
decides which meaning applies — so you never have to guess.

| Feature                     | How it is decided                                                                                                                                     |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ }`                       | A block, unless it follows `=` (map / structure literal) or sits in a command-argument position (raw [NBT](/reference/commands#the-nbt-escape-hatch)) |
| `{` after a control header  | Must stay on the header line; a leading `{` starts a new bare block statement                                                                         |
| `< >`                       | Generic parameters in type position (`list<num>`); comparison in expression position                                                                  |
| `( )` adjacent to an ident  | Function call                                                                                                                                         |
| `( )` after whitespace      | Coordinate / vector atom only (see [Functions](/reference/functions#calling-a-function))                                                              |
| `with(…)`                   | Command [options block](/reference/commands#command-options)                                                                                          |
| `\|>`                       | A **line-continuation marker**: a line beginning with `\|>` continues the previous statement. Never an operator, and never `\|\|`                     |
| `#[…]`                      | [Attribute](/reference/functions#entry-points) for the declaration below it, never a comment                                                          |
| `$name`                     | Variable reference in a command; interpolation inside a string                                                                                        |
| `.scores.x`                 | User objective; any other `.name` is a domain property                                                                                                |
| `at` `as` `unless` `with` … | A keyword only in the documented position; an ordinary identifier elsewhere                                                                           |
| `` `…` ``                   | Raw-command [escape hatch](/reference/commands#the-raw-command-escape-hatch)                                                                          |

## The rules that decide most cases

1. **Adjacency matters only for calls.** `foo(a)` is a call; `foo (a)` is not — a `(` after
   whitespace must start a coordinate atom, or it is an error. Everywhere else the language
   is whitespace-insensitive.
2. **Position decides, not spelling.** A word such as `at`, `tick` or a type name is a keyword
   only in its documented position; everywhere else it is an ordinary identifier, so command
   names like `tag`, `team` or `tick` keep working.
3. **Form decides statement or expression — not punctuation.** `let`, assignment, `while`,
   `for`, `repeat`, `execute`, commands and `return` are statements (no value); everything
   else is an expression. A `{ }` block's value is its last expression, so a function may omit
   a trailing `return` — see
   [Control Flow & Scopes](/reference/control-flow#statements-and-expressions).
