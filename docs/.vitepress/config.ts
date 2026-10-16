import { defineConfig } from 'vitepress';
import { simyLang } from './simy';

/** Canonical repository, linked from the top-right of every page. */
const repoUrl = 'https://github.com/Simy-Launguage/Simy-Docs';

/** Published as a GitHub Pages project site, so `base` is part of the hostname. */
const siteUrl = 'https://simy-launguage.github.io/Simy-Docs/';

const socialLinks = [{ icon: 'github' as const, link: repoUrl }];

const enNav = [
  { text: 'Guide', link: '/guide/introduction', activeMatch: '^/guide/' },
  { text: 'Reference', link: '/reference/lexical', activeMatch: '^/reference/' },
];

const enSidebar = {
  '/guide/': [
    {
      text: 'Guide',
      items: [
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'Installation', link: '/guide/installation' },
        { text: 'Design Principles', link: '/guide/design-principles' },
        { text: 'Why Rust-like Syntax?', link: '/guide/why-rust-like' },
      ],
    },
  ],
  '/reference/': [
    {
      text: 'Language Reference',
      items: [
        { text: 'Lexical Structure', link: '/reference/lexical' },
        { text: 'Variables & Types', link: '/reference/variables-and-types' },
        { text: 'Functions', link: '/reference/functions' },
        { text: 'Control Flow & Scopes', link: '/reference/control-flow' },
        { text: 'Commands & Minecraft Atoms', link: '/reference/commands' },
        { text: 'Operators', link: '/reference/operators' },
        { text: 'Components', link: '/reference/components' },
        { text: 'Naming & Namespaces', link: '/reference/conventions' },
      ],
    },
    {
      text: 'Appendix',
      items: [{ text: 'Examples & Compilation', link: '/reference/examples' }],
    },
  ],
};

const zhNav = [
  { text: '指南', link: '/zh/guide/introduction', activeMatch: '^/zh/guide/' },
  { text: '语法参考', link: '/zh/reference/lexical', activeMatch: '^/zh/reference/' },
];

const zhSidebar = {
  '/zh/guide/': [
    {
      text: '指南',
      items: [
        { text: '简介', link: '/zh/guide/introduction' },
        { text: '安装', link: '/zh/guide/installation' },
        { text: '设计原则', link: '/zh/guide/design-principles' },
        { text: '为什么像 Rust', link: '/zh/guide/why-rust-like' },
      ],
    },
  ],
  '/zh/reference/': [
    {
      text: '语言参考',
      items: [
        { text: '词法', link: '/zh/reference/lexical' },
        { text: '变量与类型', link: '/zh/reference/variables-and-types' },
        { text: '函数', link: '/zh/reference/functions' },
        { text: '控制流与作用域', link: '/zh/reference/control-flow' },
        { text: '命令与 Minecraft 原子', link: '/zh/reference/commands' },
        { text: '运算符', link: '/zh/reference/operators' },
        { text: '组件', link: '/zh/reference/components' },
        { text: '命名与命名空间', link: '/zh/reference/conventions' },
      ],
    },
    {
      text: '附录',
      items: [{ text: '示例与编译映射', link: '/zh/reference/examples' }],
    },
  ],
};

export default defineConfig({
  base: '/Simy-Docs/',
  cleanUrls: true,
  sitemap: {
    // `base` has to be part of the hostname.
    hostname: siteUrl,
  },
  markdown: {
    languages: [simyLang as any],
  },
  head: [['meta', { name: 'theme-color', content: '#3b82f6' }]],
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Simy',
      description: 'Simy — a DSL for Minecraft datapack development.',
      themeConfig: {
        nav: enNav,
        socialLinks,
        sidebar: enSidebar,
        outline: { level: [2, 3], label: 'On this page' },
        search: { provider: 'local' },
        docFooter: { prev: 'Previous', next: 'Next' },
        darkModeSwitchLabel: 'Appearance',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to top',
        langMenuLabel: 'Change language',
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © Simy contributors',
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'Simy',
      description: 'Simy —— 面向 Minecraft 数据包开发的 DSL。',
      themeConfig: {
        nav: zhNav,
        socialLinks,
        sidebar: zhSidebar,
        outline: { level: [2, 3], label: '本页目录' },
        search: {
          provider: 'local',
          options: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清除查询条件',
                backButtonTitle: '返回',
                noResultsText: '未找到相关结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc',
                },
              },
            },
          },
        },
        docFooter: { prev: '上一页', next: '下一页' },
        darkModeSwitchLabel: '外观',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
        langMenuLabel: '切换语言',
        notFound: {
          title: '页面未找到',
          quote: '页面走丢了，请检查地址是否正确。',
          linkText: '回到首页',
        },
        footer: {
          message: '基于 MIT 许可证发布。',
          copyright: 'Copyright © Simy contributors',
        },
      },
    },
  },
});
