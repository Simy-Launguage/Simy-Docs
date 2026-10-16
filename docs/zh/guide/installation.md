# 安装

Simy 没有独立安装包。编译器就是一个普通的 Rust 包（crate）——`simy-cli`，它提供 `simy`
命令——因此要用 **Cargo** 安装。Cargo 属于 Rust 工具链的一部分，所以顺序是：先装 Rust，
再装 Simy。

::: warning 编译器仍在开发中
目前编译器处于 **M0**（脚手架）阶段：crate 结构、CLI 骨架和编译管线模块已经就位，但
解析器、`simy.kdl` 清单与代码生成仍在编写，也尚未发布到 crates.io。现阶段想拿到 `simy`
命令，只能从源码构建。下面写的是目标流程，等 crate 发布后可以照此执行。
:::

## 1. 安装 Rust 工具链

用官方安装器 [rustup](https://rustup.rs/) 安装 Rust。它会一并装好 Cargo，并把 `rustc`、
`cargo` 等命令加入 `PATH`。

**Windows** —— 下载并运行 [`rustup-init.exe`](https://rustup.rs/)，或在 PowerShell 里用
winget：

```powershell
winget install Rustlang.Rustup
```

**macOS / Linux**：

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

rustup 询问时选默认的 stable 工具链即可。如果 Windows 上提示缺少 C++ 链接器，就让安装器
装 **Visual Studio C++ 生成工具** —— Rust 链接二进制时需要它们。

然后**新开一个终端**（让 `PATH` 生效）并检查版本：

```sh
rustc --version
cargo --version
```

Simy 使用 Rust **2024 edition**，因此工具链需要 **1.85 或更高**。用 `rustup update` 保持最新。

## 2. 安装 Simy 编译器

等 crate 发布到 crates.io 后，一条命令即可：

```sh
cargo install simy-cli
```

Cargo 会下载源码、在本机编译，并把 `simy` 可执行文件放进 Cargo 的 bin 目录
（`~/.cargo/bin`，Windows 上是 `%USERPROFILE%\.cargo\bin`）——第 1 步的 rustup 已经把它
加进了 `PATH`。

在正式发布之前，可以直接从仓库构建同一个可执行文件：

```sh
git clone https://github.com/Simy-Launguage/Simy
cd Simy
cargo install --path crates/simy-cli
```

无论是 `git clone` 还是解压源码包，这条命令都适用。

## 3. 验证安装

```sh
simy --help
```

能打印出命令列表就说明装好了。请注意 M0 阶段的现状：你会看到 CLI 骨架，而不是一个能跑的
转译器。面向用户的命令会随后续里程碑到来 —— `simy new`（生成项目脚手架）在 **M2**，
`simy build`（`.simy` → `dist/` 里的数据包）在 **M3**。

## 保持更新

```sh
rustup update                  # 更新工具链
cargo install simy-cli --force # 新版本发布后更新编译器
cargo uninstall simy-cli       # 卸载
```

## 相关仓库

| 仓库                                                                   | 作用                                              |
| :--------------------------------------------------------------------- | :------------------------------------------------ |
| [Simy](https://github.com/Simy-Launguage/Simy)                         | 编译器 crate：`simy-core`、`simy-cli`、`simy-lsp` |
| [Simy-Docs](https://github.com/Simy-Launguage/Simy-Docs)               | 本文件站点                                        |
| [tree-sitter-simy](https://github.com/Simy-Launguage/tree-sitter-simy) | Tree-sitter 语法 —— 语法规范的唯一事实来源        |
| [Zed-Simy](https://github.com/Simy-Launguage/Zed-Simy)                 | Zed 编辑器扩展（高亮、括号、折叠、大纲）          |

## 下一步

- [简介](/zh/guide/introduction) —— Simy 是什么，编译成什么。
- [语法参考](/zh/reference/lexical) —— 按主题逐个看这门语言。
