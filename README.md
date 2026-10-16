# Simy Docs

[English](README.md) · [简体中文](README.zh-CN.md)

[![Build & Deploy](https://img.shields.io/github/actions/workflow/status/Neutriny/Simy-Docs/deploy.yml?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=1e3a5f&label=Build%20%26%20Deploy)](https://github.com/Neutriny/Simy-Docs/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639?style=for-the-badge&logo=opensourceinitiative&logoColor=white&labelColor=1e3a5f)](LICENSE)

Documentation site for **Simy**, a DSL for **Minecraft datapack development**. Simy puts a
modern, Rust-flavoured surface syntax on top of the reality of `scoreboard` / `NBT` /
`execute`, and transpiles to `mcfunction` and JSON that vanilla Minecraft runs. The docs
describe the current grammar (**v0.1**).

- English: <https://neutriny.github.io/Simy-Docs/>
- 简体中文: <https://neutriny.github.io/Simy-Docs/zh/>

The site itself is a bilingual (English + Simplified Chinese) static site built with
VitePress and deployed to GitHub Pages.

## Tech stack

[![VitePress 2.0.0-alpha.20](https://img.shields.io/badge/VitePress-2.0.0--alpha.20-5C73E7?style=for-the-badge&logo=vitepress&logoColor=white&labelColor=1e3a5f)](https://vitepress.dev/)
[![Vue 3.5](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white&labelColor=1e3a5f)](https://vuejs.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=1e3a5f)](https://vite.dev/)
[![Vite+ 1.3.0](https://img.shields.io/badge/Vite%2B-1.3.0-BD34FE?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://viteplus.dev/)
[![pnpm v12](https://img.shields.io/badge/pnpm-v12-F69220?style=for-the-badge&logo=pnpm&logoColor=white&labelColor=1e3a5f)](https://pnpm.io/)
[![Shiki syntax highlighting](https://img.shields.io/badge/Shiki-syntax%20highlight-FF3670?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://shiki.style/)
[![Local search minisearch](https://img.shields.io/badge/Local%20search-minisearch-3b82f6?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://github.com/lucaong/minisearch)
[![i18n EN · ZH](https://img.shields.io/badge/i18n-EN%20%C2%B7%20ZH-3b82f6?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://vitepress.dev/guide/i18n)
[![SEO sitemap.xml · hreflang](https://img.shields.io/badge/SEO-sitemap.xml%20%C2%B7%20hreflang-3b82f6?style=for-the-badge&logoColor=white&labelColor=1e3a5f)](https://vitepress.dev/guide/sitemap-generation)
[![vp check — oxfmt · oxlint · tsc](https://img.shields.io/badge/vp%20check-oxfmt%20%C2%B7%20oxlint%20%C2%B7%20tsc-3b82f6?style=for-the-badge&logo=oxc&logoColor=white&labelColor=1e3a5f)](https://viteplus.dev/guide/check)
[![GitHub Actions CI](https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=1e3a5f)](.github/workflows/deploy.yml)
[![GitHub Pages CD](https://img.shields.io/badge/GitHub%20Pages-CD-181717?style=for-the-badge&logo=githubpages&logoColor=white&labelColor=1e3a5f)](https://pages.github.com/)

- **One toolchain, one lockfile.** Vite, the formatter, the linter and the package manager all
  come from the Vite+ release pinned in `pnpm-workspace.yaml`, so local runs and CI produce the
  same output. `pnpm-lock.yaml` keeps the whole graph reproducible.
- **The syntax highlighting is handwritten.** `docs/.vitepress/simy.ts` is a small TextMate
  grammar, so ` ```simy ` snippets are highlighted without waiting for Shiki to ship support.
- **Search runs client-side.** VitePress' local search bundles a
  [minisearch](https://github.com/lucaong/minisearch) index into the site — no Algolia account,
  no network calls — with the Chinese UI strings translated in `config.ts`.
- **Bilingual by configuration.** English lives at `/`, Simplified Chinese at `/zh/`; nav,
  sidebar, outline labels, local-search copy and 404 text are declared per locale.
- **SEO is generated.** `sitemap.xml` lists both locales and cross-links them with
  `hreflang` alternates, while `cleanUrls` keeps links extension-free.
- **Checks run before every commit.** `vp check` (oxfmt formatting, type-aware oxlint, TypeScript
  type check) is wired into `.vite-hooks/pre-commit` through `vp staged`.

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
