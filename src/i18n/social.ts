/**
 * Social metadata must render in the static HTML head.
 * Crawlers such as LinkedInBot do not run the locale-selection JavaScript.
 */
export const share = {
  siteName: 'João Henrique Serodio',
  image: '/social-preview.jpg',
  width: 1200,
  height: 630,
  en: {
    title: 'João Henrique Serodio | Software Engineer & Architect',
    description: 'Staff software engineer and architect working with distributed systems, Rust, and applied computational mathematics. Explore my résumé, technical articles, and open-source research.',
  },
  pt: {
    title: 'João Henrique Serodio | Engenheiro de Software e Arquiteto',
    description: 'Engenheiro de software e arquiteto com experiência em sistemas distribuídos, Rust e matemática aplicada computacional. Conheça o currículo, os artigos técnicos e os projetos open source.',
  },
} as const;
