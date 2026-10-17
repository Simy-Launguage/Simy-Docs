# 安装

Simy 有一个转译器 —— `simy-cli`，一个普通的命令行工具。获取它有多种方式，可以根据自己的情况选择：

::: warning 编译器仍在开发中
目前编译器处于 **M0**（脚手架）阶段：crate 结构、CLI 骨架和编译管线模块已经就位，但
解析器、`simy.kdl` 清单与代码生成仍在编写。**目前还没有可下载的正式版本**。
:::

## 在线 Playground

在线制作数据包，无需安装即可学习和体验 Simy 语法

- [网址](https://martinfowler.com/dsl.html) # TODO

## 快速安装

::: code-group

```sh [Windows]
$ powershell -ExecutionPolicy ByPass -c "irm https://simy.neutriny.dev/install.ps1 | iex"
```

```bash [MacOS / Linux]
$ curl -LsSf https://simy.neutriny.dev/install.sh | sh
```
:::

## Cargo

```sh
$ cargo install simy-cli
```

## Winget

```sh
$ winget install Simy.Simy
```

## Scoop

```sh
$ scoop install simy
```

## Homebrew

```sh
$ brew install simy
```

::: tip 现在可以做什么
**Zed 编辑器扩展**已经提供高亮、括号、折叠和大纲（见「相关仓库」）。在线 Playground、
安装包和包管理器都还在计划中；在它们上线之前，请走「自编译」。
:::

## 自编译

需要你的电脑上有 Rust 工具链。如果你的电脑上没有 Rust 工具链，下面有安装Rust的细致说明。

### 1. 安装 Rust 工具链

:::details 点我查看
用官方安装器 [rustup](https://rustup.rs/) 安装 Rust。它会一并装好 Cargo，并把 `rustc`、
`cargo` 等命令加入 `PATH`。

**Windows** —— 下载并运行 [`rustup-init.exe`](https://rustup.rs/)，或在 PowerShell 里用
winget：

```sh
$ winget install Rustlang.Rustup
```

**macOS / Linux**：

```sh
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

rustup 询问时选默认的 stable 工具链即可。
:::

:::details Windows：MSVC 生成工具与 Windows SDK

Rust 在 Windows 上默认使用 `x86_64-pc-windows-msvc` 目标，链接时依赖 **MSVC C++ 生成工具
与 Windows SDK**。如果之前没有装过，`rustup-init.exe` 会强制下载 VS Installer，为了附带这些
组件而安装体积庞大的 **Visual Studio 编辑器（IDE）**。

如果对磁盘空间敏感，可以先只装生成工具：

1. 下载 [Visual Studio 2026 生成工具](https://aka.ms/vs/stable/vs_BuildTools.exe)（同一个
   引导程序也列在 [Visual Studio 下载页](https://visualstudio.microsoft.com/zh-hans/downloads/)）。
2. 运行它装好 **VS Installer**，然后切到「**单个组件**」标签页。
3. 勾选 **Windows 11 SDK** 与 **适用于 x64/x86 的 MSVC 生成工具(最新版)**；使用旧版命名的
   安装器里这一项写作 **MSVC v143 - VS 2022 C++ x64/x86 生成工具(最新版)**。两项合计约
   2.5 GB。
4. 点「安装」，装完**重启**，然后再次启动 `rustup-init.exe` —— 它会检测到工具链，不再要求
   安装 Visual Studio。

![Visual Studio Installer 的「单个组件」页：勾选 Windows 11 SDK 与适用于 x64/x86 的 MSVC 生成工具(最新版)](/guide/msvc-build-tools.png)

已经装过 Visual Studio（或其他 MSVC 工具链）的话，这一步可以跳过。
:::

### 2. 检查工具链

然后**新开一个终端**（让 `PATH` 生效）并检查版本：

```sh
$ rustc --version
$ cargo --version
```

Simy 使用 Rust **2024 edition**，因此工具链需要 **1.85 或更高**。用 `rustup update` 保持最新。

### 3. 获取 Simy 转译器源码并编译

```sh
$ git clone https://github.com/Simy-Launguage/Simy
$ cd Simy
$ cargo install --path crates/simy-cli
```

## 验证安装

```sh
$ simy --help
```

能打印出命令列表就说明装好了。请注意 M0 阶段的现状：你会看到 CLI 骨架，而不是一个能跑的
转译器。面向用户的命令会随后续里程碑到来 —— `simy new`（生成项目脚手架）在 **M2**，
`simy build`（`.simy` → `dist/` 里的数据包）在 **M3**。

## 更新与卸载

使用包管理器：

:::code-group

```sh [Cargo]
$ rustup update                  # 更新工具链
$ cargo install simy-cli --force # 新版本发布后更新编译器
$ cargo uninstall simy-cli       # 卸载
```

```sh [Winget]
$ winget upgrade --id Simy.Simy # 更新
$ winget uninstall --id Simy.Simy         # 卸载
```

```sh [Scoop]
$ scoop update simy   # 更新
$ scoop uninstall simy # 卸载
```

```sh [Homebrew]
$ brew upgrade simy   # 更新
$ brew uninstall simy # 卸载
```
:::

如果用的是上面的快速安装：

:::code-group

```sh [Windows]
$ rm path -r # 路径名称待填
```

```bash [Linux]
$ rm -rf path # 路径名称待填
```

```bash [MacOS]
$ rm -rf path # 路径名称待填
```

:::

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
