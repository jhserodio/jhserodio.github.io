import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublishedArticles, entrySlug } from '../../lib/content';

export const GET: APIRoute = async (context) => {
  const articles = await getPublishedArticles('en');
  return rss({
    title: 'João Henrique Serodio',
    description: 'Articles about software and mathematics',
    site: context.site ?? 'https://jhserodio.github.io',
    items: articles.map(article => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: '/en/articles/' + entrySlug(article.id) + '/',
    })),
  });
};
