import { getRelativeLocaleUrl } from 'astro:i18n';
import { ui, type Lang } from './ui';
export { getResume } from './resume-data';

export const t = (lang: Lang) => ui[lang];
export const locales: Lang[] = ['pt', 'en'];
export const alternateLang = (lang: Lang): Lang => lang === 'pt' ? 'en' : 'pt';
export const localePath = (lang: Lang, path = '') => getRelativeLocaleUrl(lang, path);
