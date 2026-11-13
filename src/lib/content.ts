import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Article = CollectionEntry<'articles'>;
export type App = CollectionEntry<'apps'>;
export const entrySlug = (id: string) => id.split('/').slice(1).join('/');

export async function getPublishedArticles(lang: Lang): Promise<Article[]> {
  const result = await getCollection('articles', ({ data }) => data.publish && data.lang === lang);
  return result.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}
export async function getApps(lang: Lang): Promise<App[]> {
  return (await getCollection('apps', ({ data }) => data.lang === lang))
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
}
export async function articlePathsFor(lang: Lang) {
  const entries = await getPublishedArticles(lang);
  return entries.filter(({ id }) => id.startsWith(`${lang}/`)).map((entry) => ({
    params: { slug: entrySlug(entry.id) }, props: { entry },
  }));
}
export async function appPathsFor(lang: Lang) {
  const entries = await getApps(lang);
  return entries.filter(({ id }) => id.startsWith(`${lang}/`)).map((entry) => ({
    params: { slug: entrySlug(entry.id) }, props: { entry },
  }));
}
