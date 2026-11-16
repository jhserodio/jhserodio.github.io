import { coverLetterPt } from './cover-letter/pt';
import { coverLetterEn } from './cover-letter/en';
import type { Lang } from './ui';

// The original cover letters use empty COMPANY_NAME/POSITION constants.
// Preserve their three substantial paragraphs but use a generic public
// introduction and closing, never render unfilled company placeholders.
export function getCoverLetter(lang: Lang) {
  if (lang === 'pt') {
    return {
      greeting: 'Olá,',
      introduction: 'Escrevo para apresentar minha trajetória em arquitetura de software, desenvolvimento full-stack e liderança técnica.',
      paragraphs: [
        coverLetterPt.paragraphs.first,
        coverLetterPt.paragraphs.second,
        coverLetterPt.paragraphs.third,
      ],
      closing: 'Obrigado pela atenção e tenha um ótimo dia.',
    };
  }
  return {
    greeting: 'Hello,',
    introduction: 'I am writing to introduce my background in software architecture, full-stack development and technical leadership.',
    paragraphs: [
      coverLetterEn.paragraphs.first,
      coverLetterEn.paragraphs.second,
      coverLetterEn.paragraphs.third,
    ],
    closing: coverLetterEn.by,
  };
}
