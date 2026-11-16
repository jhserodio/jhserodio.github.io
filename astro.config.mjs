import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkObsidian } from './src/plugins/remark-obsidian.mjs';

export default defineConfig({
  site: 'https://serodio.dev',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    expressiveCode({
      // GitHub Dark Dimmed is the closest bundled Shiki palette to the
      // site's dark blue/slate theme, with accessible blue-based highlights.
      themes: ['github-dark-dimmed'],
      // Configure the renderer itself rather than relying on brittle
      // CSS overrides for the generated highlighting markup.
      styleOverrides: {
        codeBackground: '#10151d',
        codeForeground: '#e6edf6',
        borderColor: '#435975',
        borderWidth: '1px',
        borderRadius: '0.65rem',
        focusBorder: '#8fc9ff',
        codeFontFamily: "'Fantasque Sans Mono', monospace",
        uiFontFamily: "'Fantasque Sans Mono', monospace",
        codeFontSize: '0.98rem',
        codeLineHeight: '1.65',
      },
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkObsidian],
    rehypePlugins: [rehypeKatex],
    syntaxHighlight: false,
  },
});
