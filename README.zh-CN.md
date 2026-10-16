# Simy 文档

[English](README.md) · [简体中文](README.zh-CN.md)

[![Build & Deploy Docs](https://github.com/Neutriny/Simy-Docs/actions/workflows/deploy.yml/badge.svg)](https://github.com/Neutriny/Simy-Docs/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Simy** 文档站。Simy 是一门面向 **Minecraft 数据包开发**的 DSL：表层是现代化的
Rust 风格语法，底层忠实映射 `scoreboard` / `NBT` / `execute` 的现实，最终转译为原版
Minecraft 可直接运行的 `mcfunction` 与 JSON。本文档描述当前语法（**v0.1**）。

- English: <https://neutriny.github.io/Simy-Docs/>
- 简体中文: <https://neutriny.github.io/Simy-Docs/zh/>

站点本身是一个中英双语静态站，使用 VitePress 构建并部署在 GitHub Pages 上。

## 技术栈

| 层面         | 选型                                                                                       | 说明                                                                                          |
| :----------- | :----------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| 站点生成器   | [VitePress](https://vitepress.dev/zh/) `2.0.0-alpha.20`                                    | Markdown 优先，逐页生成静态 HTML，可用 Vue 组件                                               |
| UI 框架      | [Vue](https://cn.vuejs.org/) `3.5`                                                         | VitePress 默认主题，由 `docs/.vitepress/theme` 扩展                                           |
| 打包器       | [Vite](https://cn.vite.dev/) 8（`vite-plus-core`）                                         | 通过 Vite+ 调用，不直接使用                                                                   |
| 统一工具链   | [Vite+](https://viteplus.dev/) `1.3.0`（`vp` CLI）                                         | 一个 CLI 统一管理运行时、包管理器、构建、格式化、Lint 与类型检查                              |
| 包管理器     | [pnpm](https://pnpm.io/zh/) `12.14.0`                                                      | 在 `package.json` → `devEngines.packageManager` 中声明（`onFail: download`）                  |
| 依赖版本锁定 | pnpm workspace **catalog**                                                                 | `pnpm-workspace.yaml` 把 `vite` 映射到 `@voidzero-dev/vite-plus-core`，全仓统一               |
| 代码高亮     | [Shiki](https://shiki.style/)（随 VitePress 内置）                                         | `docs/.vitepress/simy.ts` 提供自定义 TextMate 语法，高亮 ` ```simy ` 代码块                   |
| 搜索         | VitePress 本地搜索                                                                         | 基于 [minisearch](https://github.com/lucaong/minisearch) 建立索引，无第三方服务，界面已中文化 |
| 国际化       | VitePress locales                                                                          | 根 locale 为英文，`/zh/` 为简体中文，各自拥有导航、侧边栏与目录标签                           |
| SEO          | `sitemap.xml` + `cleanUrls`                                                                | 双语页面输出 `<xhtml:link rel="alternate" hreflang="…">` 互指                                 |
| 质量检查     | `vp check`                                                                                 | 一条命令完成 oxfmt 格式化、oxlint 类型感知 Lint 与 TypeScript 类型检查                        |
| Git 钩子     | `.vite-hooks/pre-commit` → `vp staged`                                                     | 对暂存文件执行 `vp check --fix`（在 `vite.config.ts` 中配置）                                 |
| CI/CD        | [GitHub Actions](.github/workflows/deploy.yml) → [GitHub Pages](https://pages.github.com/) | 用 `voidzero-dev/setup-vp` 构建，用 `actions/deploy-pages` 发布                               |

除 Node.js 本身外，其余工具都来自锁定版本的 Vite+ 工具链，因此本地与 CI 使用同一套
Vite、pnpm 与格式化器版本。

## 目录结构

````text
.
├─ .github/
│  └─ workflows/deploy.yml    # 构建并部署到 GitHub Pages
├─ .vite-hooks/pre-commit     # `vp staged` → `vp check --fix`
├─ docs/                      # VitePress 源目录（`vitepress dev docs`）
│  ├─ .vitepress/
│  │  ├─ config.ts            # base、locales、导航、侧边栏、sitemap
│  │  ├─ simy.ts              # ```simy 代码块的 TextMate 语法
│  │  └─ theme/               # 自定义主题入口与品牌样式
│  ├─ index.md                # 英文首页
│  ├─ guide/                  # 英文指南
│  ├─ reference/              # 英文语法参考
│  └─ zh/                     # 简体中文文档（与英文结构一一对应）
├─ vite.config.ts             # Vite+ 配置：fmt、lint、staged
├─ pnpm-workspace.yaml        # catalog、overrides、允许构建的依赖
└─ package.json               # 脚本与 devEngines（pnpm 12）
````

## 快速开始

前置条件：`vp` CLI（[Vite+](https://viteplus.dev/guide/)）与 Git。Node.js 与 pnpm 由项目
配置自动解析，无需额外准备。

```bash
vp install      # 安装依赖
vp dev          # 带 HMR 的开发服务器 → http://localhost:5173/Simy-Docs/
vp run build    # 生产构建 → docs/.vitepress/dist
vp run serve    # 预览构建产物
vp check        # 格式化 + Lint + 类型检查
```

> [!NOTE]
> 站点部署在项目子路径下（`base: '/Simy-Docs/'`），所以开发服务器地址也带该前缀。
> `vp <name>` 执行的是 Vite+ 内置命令，`vp run <name>` 执行的是 `package.json` 中同名脚本
> —— 构建文档请用 `vp run build`。

## 撰写文档

- 英文页面放在 `docs/`，中文页面放在 `docs/zh/`（相对路径保持一致，例如
  `docs/guide/introduction.md` ⇄ `docs/zh/guide/introduction.md`）。请同步维护两种语言。
- 新增页面后，需要在 `docs/.vitepress/config.ts` 的 `enSidebar` / `zhSidebar`（以及
  `enNav` / `zhNav`）中登记。
- Simy 代码片段请使用 ` ```simy ` 围栏，高亮由 `docs/.vitepress/simy.ts` 中的语法提供。
- Markdown 由 oxfmt 统一格式化，推送前执行 `vp check --fix` 即可（提交时 pre-commit
  钩子也会自动执行）。

## 部署

`.github/workflows/deploy.yml` 在每次推送到 `main`、Pull Request（只构建、不部署）以及
手动触发时运行，流程为：

1. 检出仓库，并通过 `voidzero-dev/setup-vp` 准备 Vite+ / Node.js / pnpm；
2. 用 `vp run build` 构建站点；
3. 上传 `docs/.vitepress/dist`，通过官方 `actions/configure-pages`、
   `actions/upload-pages-artifact`、`actions/deploy-pages` 发布到 GitHub Pages。

线上地址：<https://neutriny.github.io/Simy-Docs/>。仓库 **Settings** → **Pages** →
**Build and deployment** 的 **Source** 应选择 **GitHub Actions**（`configure-pages` 配置了
`enablement: true`，首次运行会自动开启）。

### 绑定自定义域名

若要把文档换到独立域名，而不是项目子路径：

1. 在 `docs/.vitepress/config.ts` 中设置 `base: '/'` 与
   `sitemap.hostname: 'https://<域名>/'`；
2. 新增 `docs/public/CNAME`，内容为域名；
3. 将 DNS 解析指向 GitHub Pages。

## 许可协议

基于 [MIT 许可证](LICENSE)发布。© Simy contributors。
