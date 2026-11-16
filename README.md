# João Henrique Serodio — Personal website (Astro)

Bilingual static portfolio built with **Astro 5** and published as a GitHub Pages site. This `update-resume` branch refactors the existing site while preserving the public Resume and Cover Letter content previously held on `master`.

## Pages

| Page | Portuguese | English |
|---|---|---|
| Home | `/pt/` | `/en/` |
| Resume | `/pt/resume/` | `/en/resume/` |
| Articles | `/pt/articles/` | `/en/articles/` |
| Article demo | `/pt/articles/boas-vindas/` | `/en/articles/welcome/` |
| Apps | `/pt/apps/` | `/en/apps/` |
| Cover Letter | `/pt/cover-letter/` | `/en/cover-letter/` |

The home page provides a brief introduction, links to internal pages and public contact profiles. Resume includes actual experience descriptions, technologies associated with supported roles, education, languages, skills and project links. The generic public Cover Letter keeps the original substantive paragraphs but avoids empty company and position placeholders.

**Original career data:** `src/i18n/resume/{pt,en}.ts`, `src/i18n/me/{pt,en}.ts` and `src/i18n/cover-letter/{pt,en}.ts`. The transformation in `src/i18n/resume-data.ts` validates the output and checks translation parity. Review the original dates and statements before publishing public changes.

## Development

Requires Node.js 22+ and npm. From the repo root:

```bash
npm ci
npm test
npm run check
npm run build
npm run dev
```

The `Verify Astro site` workflow runs on `update-resume` and on pull requests into `master`; it installs locked dependencies, runs tests and checks, builds the static site, and verifies the generated routes. The Pages deployment workflow only publishes when `master` receives updates, never from this branch.

The canonical domain is `https://serodio.dev`. Confirm it matches the active GitHub Pages custom-domain configuration before merging.

## Architecture and content

- `src/layouts/BaseLayout.astro`: shared SEO, header, footer, accessibility, canonical and alternate-language URLs.
- `src/templates/`: Home, Resume, Cover Letter, Articles and Apps templates.
- `src/content.config.ts`: Zod-validated Astro Content Collections.
- `src/content/articles/{pt,en}/*.md`: Markdown articles with `publish: true`, translation keys and optional cover images.
- `src/content/apps/{pt,en}/*.json`: external projects, planned WASM demos, and future API-backed apps.
- `src/lib/content.ts`: published content discovery and stable paths. Detail routes use `[slug].astro` and never collide with `index.astro`.
- `public/app-runner.js`: client-side runner, loaded only for executable app detail pages.
- `src/plugins/remark-obsidian.mjs`: a subset of Obsidian wikilinks, images and callouts.

The article demo exercises GFM, footnotes, blockquotes, bibliography, syntax-highlighted Rust, complex inline and block KaTeX math, and an accessible SVG illustration. It is available in both languages.

## Obsidian import and WASM

To synchronize explicitly approved Obsidian notes:

```bash
OBSIDIAN_VAULT_DIR=/path/to/vault npm run sync:vault
```

Only notes with `publish: true` are considered; the pipeline generates `src/content/articles/{pt,en}/vault/` and `public/vault-assets/`. Check the generated public output before deploying. Some Obsidian syntax is intentionally unsupported.

The CVRP WASM app is **planned**, not executable. The Rust crate does not exist yet. `npm run build:wasm` safely skips it until a real implementation is added. External Apps link directly to their public repositories.

## Language selection and compatibility

The root route selects a saved explicit preference first, then a supported language from `navigator.languages`, defaulting to Portuguese. An explicit localized URL is never overridden. The language switch keeps article translations paired by `translationKey` and returns to the alternate-language article index when a translation is unavailable.

Legacy `/resume/` and `/cover-letter/` URLs redirect in the browser while preserving query strings and hashes.
