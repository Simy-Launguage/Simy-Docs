# Installation

Simy ships **no standalone installer**. The compiler is an ordinary Rust crate — the
`simy-cli` package, which provides the `simy` command — so it is installed with **Cargo**.
Cargo is part of the Rust toolchain, which means: install Rust first, then install Simy.

::: warning The compiler is still being built
Right now the compiler sits at milestone **M0** (scaffold): the crate layout, the CLI skeleton
and the pipeline modules exist, but the parser, the `simy.kdl` manifest and code generation are
still being written, and nothing has been published to crates.io yet. Today the only way to
get a `simy` binary is to build it from source. The steps below describe the intended
workflow, so they can be followed as-is once the crate is released.
:::

## 1. Install the Rust toolchain

Install Rust with [rustup](https://rustup.rs/), the official installer. It also installs Cargo
and puts `rustc`, `cargo` and friends on your `PATH`.

**Windows** — download and run [`rustup-init.exe`](https://rustup.rs/), or install it with
winget from PowerShell:

```powershell
winget install Rustlang.Rustup
```

**macOS / Linux**:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

When rustup asks, the default (stable) toolchain is the right choice. If the installer reports
that a C++ linker is missing on Windows, let it install the **Visual Studio C++ Build Tools** —
Rust needs them to link binaries.

Then open a **new** terminal (so the updated `PATH` takes effect) and check the versions:

```sh
rustc --version
cargo --version
```

Simy uses Rust **edition 2024**, so the toolchain must be **1.85 or newer**. `rustup update`
keeps it up to date.

## 2. Install the Simy compiler

Once the crate is published on crates.io, one command is all it takes:

```sh
cargo install simy-cli
```

Cargo downloads the sources, builds them locally and drops the `simy` binary into the Cargo
binary directory (`~/.cargo/bin`, or `%USERPROFILE%\.cargo\bin` on Windows), which `rustup`
put on your `PATH` in step 1.

Until the release lands, build the same binary straight from the repository:

```sh
git clone https://github.com/Simy-Launguage/Simy
cd Simy
cargo install --path crates/simy-cli
```

That works with a plain `git` checkout as well as with an extracted source archive.

## 3. Check the installation

```sh
simy --help
```

The binary prints its command list. Keep the M0 status in mind: you will see the CLI skeleton
rather than a working transpile. The user-facing commands land later — `simy new` (project
scaffold) with milestone **M2**, and `simy build` (`.simy` → datapack in `dist/`) with
milestone **M3**.

## Keeping things up to date

```sh
rustup update                  # toolchain
cargo install simy-cli --force # compiler, after a new release
cargo uninstall simy-cli       # remove it again
```

## Where the project lives

| Repository                                                             | Role                                                            |
| :--------------------------------------------------------------------- | :-------------------------------------------------------------- |
| [Simy](https://github.com/Simy-Launguage/Simy)                         | compiler crates: `simy-core`, `simy-cli` and `simy-lsp`         |
| [Simy-Docs](https://github.com/Simy-Launguage/Simy-Docs)               | this documentation site                                         |
| [tree-sitter-simy](https://github.com/Simy-Launguage/tree-sitter-simy) | Tree-sitter grammar — the single source of truth for the syntax |
| [Zed-Simy](https://github.com/Simy-Launguage/Zed-Simy)                 | Zed editor extension (highlighting, brackets, folding, outline) |

## Next steps

- [Introduction](/guide/introduction) — what Simy is and what it compiles to.
- [Syntax reference](/reference/lexical) — the language, topic by topic.
