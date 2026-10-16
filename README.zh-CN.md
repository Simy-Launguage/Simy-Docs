# Simy 文档

[English](README.md) · [简体中文](README.zh-CN.md)

[![构建 & 部署](https://img.shields.io/github/actions/workflow/status/Neutriny/Simy-Docs/deploy.yml?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=1e3a5f&label=%E6%9E%84%E5%BB%BA%20%26%20%E9%83%A8%E7%BD%B2)](https://github.com/Neutriny/Simy-Docs/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639?style=for-the-badge&logo=opensourceinitiative&logoColor=white&labelColor=1e3a5f)](LICENSE)

**Simy** 文档站。Simy 是一门面向 **Minecraft 数据包开发**的 DSL：表层是现代化的
Rust 风格语法，底层忠实映射 `scoreboard` / `NBT` / `execute` 的现实，最终转译为原版
Minecraft 可直接运行的 `mcfunction` 与 JSON。本文档描述当前语法（**v0.1**）。

- English: <https://neutriny.github.io/Simy-Docs/>
- 简体中文: <https://neutriny.github.io/Simy-Docs/zh/>

站点本身是一个中英双语静态站，使用 VitePress 构建并部署在 GitHub Pages 上。

## 技术栈

[![VitePress 2.0.0-alpha.20](https://img.shields.io/badge/VitePress-2.0.0--alpha.20-5C73E7?style=for-the-badge&logo=vitepress&logoColor=white&labelColor=1e3a5f)](https://vitepress.dev/zh/)
[![Vue 3.5](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white&labelColor=1e3a5f)](https://cn.vuejs.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=1e3a5f)](https://cn.vite.dev/)
[![Vite+ 1.3.0](https://img.shields.io/badge/Vite%2B-1.3.0-BD34FE?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://viteplus.dev/)
[![pnpm v12](https://img.shields.io/badge/pnpm-v12-F69220?style=for-the-badge&logo=pnpm&logoColor=white&labelColor=1e3a5f)](https://pnpm.io/zh/)
[![Shiki 语法高亮](https://img.shields.io/badge/Shiki-%E8%AF%AD%E6%B3%95%E9%AB%98%E4%BA%AE-FF3670?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://shiki.style/)
[![本地搜索 minisearch](https://img.shields.io/badge/%E6%9C%AC%E5%9C%B0%E6%90%9C%E7%B4%A2-minisearch-3b82f6?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://github.com/lucaong/minisearch)
[![i18n EN · 中文](https://img.shields.io/badge/i18n-EN%20%C2%B7%20%E4%B8%AD%E6%96%87-3b82f6?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://vitepress.dev/zh/guide/i18n)
[![SEO sitemap.xml · hreflang](https://img.shields.io/badge/SEO-sitemap.xml%20%C2%B7%20hreflang-3b82f6?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://vitepress.dev/zh/guide/sitemap-generation)
[![vp check — 格式 · Lint · 类型](https://img.shields.io/badge/vp%20check-%E6%A0%BC%E5%BC%8F%20%C2%B7%20Lint%20%C2%B7%20%E7%B1%BB%E5%9E%8B-3b82f6?style=for-the-badge&logo=oxc&logoColor=white&labelColor=1e3a5f)](https://viteplus.dev/guide/check)
[![GitHub Actions CI](https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=1e3a5f)](.github/workflows/deploy.yml)
[![GitHub Pages CD](https://img.shields.io/badge/GitHub%20Pages-CD-181717?style=for-the-badge&logo=githubpages&logoColor=white&labelColor=1e3a5f)](https://pages.github.com/)

- **一套工具链，一份锁文件。** Vite、格式化器、Lint 与包管理器都来自
  `pnpm-workspace.yaml` 中锁定的 Vite+ 版本，本地与 CI 产出完全一致；
  `pnpm-lock.yaml` 保证整个依赖图可复现。
- **高亮语法是手写的。** `docs/.vitepress/simy.ts` 是一份精简的 TextMate 语法，
  因此 ` ```simy ` 代码块无需等待 Shiki 官方支持即可高亮。
- **搜索完全在客户端。** VitePress 本地搜索把
  [minisearch](https://github.com/lucaong/minisearch) 索引打包进站点，不需要 Algolia
  账号、不发起网络请求，中文界面文案已在 `config.ts` 中翻译。
- **双语靠配置实现。** 英文位于 `/`，简体中文位于 `/zh/`；导航、侧边栏、目录标签、
  搜索界面与 404 文案都按 locale 声明。
- **SEO 自动生成。** `sitemap.xml` 覆盖两种语言并用 `hreflang` 互指，
  `cleanUrls` 让链接不带 `.html` 后缀。
- **提交前自动检查。** `vp check`（oxfmt 格式化、类型感知 oxlint、TypeScript 类型检查）
  通过 `vp staged` 接入 `.vite-hooks/pre-commit`。

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
