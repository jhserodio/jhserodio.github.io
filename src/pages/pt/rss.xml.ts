import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublishedArticles, entrySlug } from '../../lib/content';

export const GET: APIRoute = async (context) => {
  const articles = await getPublishedArticles('pt');
  return rss({
    title: 'João Henrique Serodio',
    description: 'Artigos sobre software e matemática',
    site: context.site ?? 'https://jhserodio.github.io',
    items: articles.map(article => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: '/pt/articles/' + entrySlug(article.id) + '/',
    })),
  });
};
