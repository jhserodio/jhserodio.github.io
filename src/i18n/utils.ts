import { getRelativeLocaleUrl } from 'astro:i18n';
import { ResumeSchema } from './schema';
import { ui, type Lang } from './ui';
import ptResume from './resume/pt.json';
import enResume from './resume/en.json';

export const t = (lang: Lang) => ui[lang];
export const locales: Lang[] = ['pt', 'en'];
export const alternateLang = (lang: Lang): Lang => lang === 'pt' ? 'en' : 'pt';
export const localePath = (lang: Lang, path = '') => getRelativeLocaleUrl(lang, path);

const resumeRaw = { pt: ptResume, en: enResume };
export function getResume(lang: Lang) {
  return ResumeSchema.parse(resumeRaw[lang]);
}
