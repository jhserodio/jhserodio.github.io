import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().default(''),
    lang: z.enum(['pt', 'en']),
    translationKey: z.string().min(1).optional(), // parear traduções com slugs diferentes
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(), // URL pública; não pressupõe arquivo de imagem em src/assets
    publish: z.boolean().default(false),
  }),
});

const apps = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/apps' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string(),
    lang: z.enum(['pt', 'en']),
    type: z.enum(['wasm-interactive', 'external-link', 'api-backed']),
    status: z.enum(['active', 'planned']).default('planned'),
    wasmModule: z.enum(['cvrp-solver']).optional(),
    externalUrl: z.string().url().optional(),
    apiUrl: z.string().url().optional(),
    pricing: z.enum(['free', 'open-source', 'commercial']),
    tags: z.array(z.string()).default([]),
  }).superRefine((app, ctx) => {
    if (app.type === 'external-link' && !app.externalUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'external-link exige externalUrl' });
    }
    if (app.type === 'wasm-interactive' && !app.wasmModule) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'wasm-interactive exige wasmModule' });
    }
    if (app.type === 'api-backed' && app.status === 'active' && !app.apiUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'api-backed ativo exige apiUrl' });
    }
  }),
});

export const collections = { articles, apps };
