# Simy Docs

[English](README.md) · [简体中文](README.zh-CN.md)

[![Build & Deploy Docs](https://github.com/Neutriny/Simy-Docs/actions/workflows/deploy.yml/badge.svg)](https://github.com/Neutriny/Simy-Docs/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Documentation site for **Simy**, a DSL for **Minecraft datapack development**. Simy puts a
modern, Rust-flavoured surface syntax on top of the reality of `scoreboard` / `NBT` /
`execute`, and transpiles to `mcfunction` and JSON that vanilla Minecraft runs. The docs
describe the current grammar (**v0.1**).

- English: <https://neutriny.github.io/Simy-Docs/>
- 简体中文: <https://neutriny.github.io/Simy-Docs/zh/>

The site itself is a bilingual (English + Simplified Chinese) static site built with
VitePress and deployed to GitHub Pages.

## Tech stack

| Layer            | Choice                                                                                     | Notes                                                                                                 |
| :--------------- | :----------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| Site generator   | [VitePress](https://vitepress.dev/) `2.0.0-alpha.20`                                       | Markdown-first, static HTML per page, Vue-powered components                                          |
| UI framework     | [Vue](https://vuejs.org/) `3.5`                                                            | VitePress default theme, extended by `docs/.vitepress/theme`                                          |
| Bundler          | [Vite](https://vite.dev/) 8 via `vite-plus-core`                                           | Invoked through Vite+ rather than directly                                                            |
| Toolchain        | [Vite+](https://viteplus.dev/) `1.3.0` (`vp` CLI)                                          | One CLI for runtime, package manager, dev/build, format, lint and type check                          |
| Package manager  | [pnpm](https://pnpm.io/) `12.14.0`                                                         | Declared in `package.json` → `devEngines.packageManager` (`onFail: download`)                         |
| Dependency pins  | pnpm workspace **catalog**                                                                 | `pnpm-workspace.yaml` maps `vite` to `@voidzero-dev/vite-plus-core` so every package shares it        |
| Syntax highlight | [Shiki](https://shiki.style/) (bundled with VitePress)                                     | Custom TextMate grammar in `docs/.vitepress/simy.ts` highlights ` ```simy ` fences                    |
| Search           | VitePress local search                                                                     | [minisearch](https://github.com/lucaong/minisearch) index, no third-party service, Chinese UI strings |
| i18n             | VitePress locales                                                                          | Root locale = English, `/zh/` = Simplified Chinese, each with its own nav/sidebar/outline labels      |
| SEO              | `sitemap.xml` + `cleanUrls`                                                                | Locale pages emit `<xhtml:link rel="alternate" hreflang="…">` for EN ⇄ ZH                             |
| Quality gates    | `vp check`                                                                                 | oxfmt (format), oxlint (type-aware lint) and TypeScript type checks in one command                    |
| Git hooks        | `.vite-hooks/pre-commit` → `vp staged`                                                     | Runs `vp check --fix` on staged files (configured in `vite.config.ts`)                                |
| CI/CD            | [GitHub Actions](.github/workflows/deploy.yml) → [GitHub Pages](https://pages.github.com/) | Built with `voidzero-dev/setup-vp`, published with `actions/deploy-pages`                             |

Everything except Node.js itself comes from the pinned Vite+ toolchain, so local runs and CI
use the same Vite, pnpm and formatter versions.

## Project structure

````text
.
├─ .github/
│  └─ workflows/deploy.yml    # build + deploy to GitHub Pages
├─ .vite-hooks/pre-commit     # `vp staged` → `vp check --fix`
├─ docs/                      # VitePress source root (`vitepress dev docs`)
│  ├─ .vitepress/
│  │  ├─ config.ts            # base, locales, nav, sidebar, sitemap
│  │  ├─ simy.ts              # TextMate grammar for ```simy blocks
│  │  └─ theme/               # custom theme entry + brand CSS
│  ├─ index.md                # English home
│  ├─ guide/                  # English guide
│  ├─ reference/              # English language reference
│  └─ zh/                     # Simplified Chinese docs (mirrors the layout)
├─ vite.config.ts             # Vite+ config: fmt, lint, staged
├─ pnpm-workspace.yaml        # catalog + overrides + allowed builds
└─ package.json               # scripts and devEngines (pnpm 12)
````

## Getting started

Prerequisites: the `vp` CLI ([Vite+](https://viteplus.dev/guide/)) and Git. Node.js and pnpm
are resolved from the project configuration, so no separate setup is required.

```bash
vp install      # install dependencies
vp dev          # dev server with HMR → http://localhost:5173/Simy-Docs/
vp run build    # production build → docs/.vitepress/dist
vp run serve    # preview the built output
vp check        # format + lint + type check
```

> [!NOTE]
> Because the site is served from a project sub-path (`base: '/Simy-Docs/'`), the dev server
> URL includes that prefix. `vp <name>` runs a Vite+ built-in command, while `vp run <name>`
> runs the `package.json` script of the same name — `vp run build` is the VitePress build.

## Writing docs

- English pages live in `docs/`, Chinese pages in `docs/zh/` (same relative path, e.g.
  `docs/guide/introduction.md` ⇄ `docs/zh/guide/introduction.md`). Keep both in sync.
- When you add a page, register it in the `enSidebar` / `zhSidebar` (and `enNav` / `zhNav`)
  objects in `docs/.vitepress/config.ts`.
- Wrap Simy snippets in ` ```simy ` fences to get highlighting from the grammar in
  `docs/.vitepress/simy.ts`.
- Markdown is formatted by oxfmt, so run `vp check --fix` (or just commit — the pre-commit
  hook does it) before pushing.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`, on pull requests (build only,
no deployment) and on manual dispatch. It:

1. checks out the repository and sets up Vite+ / Node.js / pnpm via
   `voidzero-dev/setup-vp`;
2. builds the site with `vp run build`;
3. uploads `docs/.vitepress/dist` and publishes it to GitHub Pages with the official
   `actions/configure-pages`, `actions/upload-pages-artifact` and `actions/deploy-pages`
   actions.

The published URL is <https://neutriny.github.io/Simy-Docs/>. Repository → **Settings** →
**Pages** → **Build and deployment** → **Source** should be **GitHub Actions**
(`configure-pages` with `enablement: true` enables it automatically on the first run).

### Custom domain

To serve the docs from an apex/custom domain instead of the project sub-path:

1. set `base: '/'` and `sitemap.hostname: 'https://<domain>/'` in `docs/.vitepress/config.ts`;
2. add `docs/public/CNAME` containing the domain;
3. point the DNS records at GitHub Pages.

## License

Released under the [MIT License](LICENSE). © Simy contributors.
