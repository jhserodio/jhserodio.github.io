import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkObsidian } from './src/plugins/remark-obsidian.mjs';

export default defineConfig({
  site: 'https://jhserodio.github.io',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    expressiveCode({ themes: ['gruvbox-dark-hard'] }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkObsidian],
    rehypePlugins: [rehypeKatex],
    syntaxHighlight: false,
  },
});
