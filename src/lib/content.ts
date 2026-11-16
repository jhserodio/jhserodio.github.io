import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Article = CollectionEntry<'articles'>;
export type App = CollectionEntry<'apps'>;

/**
 * Content entries have an explicit locale directory.
 * Normalize nested directories without introducing catch-all index collisions.
 * A slug must be nonempty and is generated from the content id, never from a
 * translated article title.
 */
export function entrySlug(id: string): string {
  const segments = id.replace(/\\/g, '/').split('/');
  if (segments.length < 2 || !['pt', 'en'].includes(segments[0])) {
    throw new Error(`Content id must start with pt/ or en/: ${id}`);
  }
  const slug = segments.slice(1).join('--');
  if (!slug || !/^[\w-]+$/.test(slug)) throw new Error(`Invalid content id: ${id}`);
  return slug;
}

export async function getPublishedArticles(lang: Lang): Promise<Article[]> {
  const entries = await getCollection('articles', ({ data }) => data.publish && data.lang === lang);
  return entries.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getApps(lang: Lang): Promise<App[]> {
  const entries = await getCollection('apps', ({ data }) => data.lang === lang);
  return entries.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

function pathsFor<T extends { id: string }>(entries: T[], lang: Lang) {
  const seen = new Set<string>();
  return entries.map((entry) => {
    if (!entry.id.startsWith(`${lang}/`)) throw new Error(`Locale mismatch: ${entry.id}`);
    const slug = entrySlug(entry.id);
    if (seen.has(slug)) throw new Error(`Duplicate slug for ${lang}: ${slug}`);
    seen.add(slug);
    return { params: { slug }, props: { entry } };
  });
}

export async function articlePathsFor(lang: Lang) {
  return pathsFor(await getPublishedArticles(lang), lang);
}

export async function appPathsFor(lang: Lang) {
  return pathsFor(await getApps(lang), lang);
}
