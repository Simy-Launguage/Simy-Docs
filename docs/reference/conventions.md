# Naming & Namespaces

::: info Lint and codegen, not grammar
The following rules **do not change the grammar**; they are enforced by **lint (the
transpiler front end)** and **codegen**.
:::

| Object          | Convention              | Owner |
| :-------------- | :---------------------- | :---- |
| Function names  | Forced `snake_case`     | lint  |
| Component names | Forced `CamelCase`      | lint  |
| Variable names  | Any case                | —     |
| File paths      | Forced lowercase        | lint  |
| `_` prefix      | Allowed, marks "unused" | lint  |

## Generated namespaces

The **generated namespaces** are **naturally isolated** from the user identifier space:

| Purpose                                         | Prefix    |
| :---------------------------------------------- | :-------- |
| Generated scoreboard objectives / internal data | `#simy/…` |
| Generated functions, tags and other resources   | `simy:…`  |

Because neither `#` nor `simy:` is in the public identifier character set, users cannot
write a colliding name. A user-written `simy:xxx` is reported by lint as a reserved
namespace.
