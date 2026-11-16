import { ResumeSchema, type ResumeData } from './schema';
import { resumePt } from './resume/pt';
import { resumeEn } from './resume/en';
import { mePt } from './me/pt';
import { meEn } from './me/en';
import type { Lang } from './ui';

// Source: the original public resume (master branch). Keep role/date/description
// text tied to each experience. Skills are assigned per experience only when
// explicitly supported by its source description.
const technologies: Record<string, string[]> = {
  boticario: ['Node.js', 'NestJS', 'React', 'TypeScript', 'AWS', 'EKS', 'Kafka', 'SQS', 'PostgreSQL', 'MongoDB'],
  vnator: ['Node.js', 'GraphQL', 'Apollo Server', 'AWS Lambda', 'Aurora PostgreSQL', 'React', 'EventBridge'],
  nzn: ['Node.js', 'LoopBack', 'Strapi', 'Next.js', 'Kubernetes'],
  pagarme: ['TypeScript', 'React', 'Redux', 'Microfrontends', 'BFF'],
  kovi: ['Node.js', 'TypeScript', 'NestJS', 'Express', 'AWS Lambda'],
  pedePronto: ['React', 'TypeScript', 'GraphQL', 'REST'],
  agrotis: ['Erlang', 'Python', 'Node.js', 'Java', 'Shell'],
  polvo: ['Frontend', 'UI'],
  freelance: ['Java', 'Node.js', 'Angular', 'jQuery'],
};

type SourceResume = typeof resumePt | typeof resumeEn;
type SourceMe = typeof mePt | typeof meEn;

function skillGroup(title: string, group: Record<string, unknown>) {
  const items = Object.values(group).flatMap((value) => {
    if (typeof value !== 'object' || value === null || !('label' in value)) return [];
    return typeof value.label === 'string' ? [value.label] : [];
  });
  return { title, items };
}

function toResume(data: SourceResume, me: SourceMe, lang: Lang): ResumeData {
  const experiences = Object.entries(data.jobs)
    .filter(([id]) => id !== 'title' && id !== 'label')
    .map(([id, source]) => {
      if (!source || typeof source !== 'object' || !('describe' in source)) return null;
      const job = source as { company: string; employ: string; started: string; finished: string; describe: string };
      return {
        id,
        company: job.company,
        role: job.employ,
        period: {
          start: job.started.trim(),
          end: /hoje|present/i.test(job.finished) ? null : job.finished.trim(),
        },
        description: job.describe.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean),
        achievements: [] as string[],
        technologies: technologies[id] ?? [],
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  const projects = [
    {
      title: 'Quantitative Developer Roadmap',
      category: 'open-source' as const,
      description: lang === 'pt'
        ? 'Roteiro público de estudos com algoritmos matemáticos, computação numérica e desenvolvimento quantitativo.'
        : 'Public study roadmap for mathematical algorithms, numerical computing and quantitative development.',
      technologies: ['Rust', 'C', 'Mathematics'],
      links: { github: 'https://github.com/vnator/quant-dev-roadmap' },
    },
    {
      title: 'vim-grimory',
      category: 'open-source' as const,
      description: lang === 'pt'
        ? 'Configuração pessoal do Neovim e ambiente de desenvolvimento.'
        : 'Personal Neovim configuration and developer environment.',
      technologies: ['Neovim', 'Lua'],
      links: { github: 'https://github.com/jhserodio/vim-grimory' },
    },
    {
      title: 'Vision Transformer Optimization — Scientific Research',
      category: 'academic' as const,
      description: lang === 'pt'
        ? 'Iniciação científica em otimização de Vision Transformers para identificação de regiões tumorais em imagens histológicas de carcinoma espinocelular oral (OSCC). Pesquisa em álgebra linear, métodos numéricos e inferência em GPU com Rust, Candle e CUDA; protótipo em desenvolvimento.'
        : 'Undergraduate research on optimizing Vision Transformers to identify tumor regions in oral squamous cell carcinoma (OSCC) histology images. Studies linear algebra, numerical methods, and GPU inference with Rust, Candle, and CUDA; prototype in progress.',
      technologies: ['Rust', 'Candle', 'CUDA', 'Vision Transformers', 'Numerical Methods'],
      links: { github: 'https://github.com/jhserodio/exploring-vit-algorithms-improvments' },
    },
    {
      title: 'Self-hosted Qwen Code Agent',
      category: 'open-source' as const,
      description: lang === 'pt'
        ? 'Agente local de assistência à programação para uso com o vim-grimory. Combina API Node.js, modelos Qwen via Ollama e recuperação de contexto com Qdrant; oferece consultas ao código, revisão e propostas de edição com aprovação explícita.'
        : 'Local-first coding agent for use with vim-grimory. Combines a Node.js API, Qwen models served by Ollama, and Qdrant-backed context retrieval; supports codebase questions, review, and approval-gated edit proposals.',
      technologies: ['Node.js', 'JavaScript', 'Qwen', 'Ollama', 'Qdrant', 'RAG', 'Neovim', 'Docker'],
      links: { github: 'https://github.com/vnator/selfhosted-qwen-codeagent' },
    },
    {
      title: 'Capacitated Vehicle Routing — Deterministic to Stochastic',
      category: 'academic' as const,
      description: lang === 'pt'
        ? 'Modelo matemático para otimização de rotas de entrega (CVRP), em fase de formulação determinística com programação inteira mista (MILP), programação dinâmica e restrições de capacidade e distância. A evolução planejada é uma abordagem estocástica para entregas em cadeias de restaurantes, inspirada em cenários de plataformas como o iFood.'
        : 'Mathematical vehicle-routing model (CVRP), currently in the deterministic formulation stage with mixed-integer linear programming (MILP), dynamic programming, and capacity/distance constraints. A planned stochastic extension will explore restaurant-chain deliveries inspired by platforms such as iFood.',
      technologies: ['Rust', 'CVRP', 'MILP', 'Dynamic Programming', 'Operations Research'],
      links: { github: 'https://github.com/jhserodio/logistic_problem_with_max_capacity' },
    },
  ];

  const stack = data.stack;
  return ResumeSchema.parse({
    summary: me.about.bio,
    experiences,
    projects,
    education: [
      {
        institution: 'UCP — Universidade do Centro do Paraná',
        degree: lang === 'pt' ? 'Bacharelado em Sistemas de Informação' : "Bachelor's in Information Systems",
        period: { start: '2008', end: '2012' },
      },
      {
        institution: lang === 'pt' ? 'Matemática Aplicada Computacional' : 'Applied Computational Mathematics',
        degree: lang === 'pt' ? 'Segunda graduação, em andamento' : 'Second undergraduate degree, in progress',
        period: { start: lang === 'pt' ? 'Em andamento' : 'In progress', end: null },
      },
    ],
    skills: [
      skillGroup(stack.developer.label, stack.developer),
      skillGroup(stack.frontend.label, stack.frontend),
      skillGroup(stack.backend.label, stack.backend),
    ],
    languages: [
      { name: data.langs.portuguese.label, level: data.langs.portuguese.level },
      { name: data.langs.english.label, level: data.langs.english.level },
    ],
    softSkills: Object.entries(data.softSkills)
      .filter(([key]) => key !== 'title')
      .map(([, value]) => value),
  });
}

const resumes: Record<Lang, ResumeData> = {
  pt: toResume(resumePt, mePt, 'pt'),
  en: toResume(resumeEn, meEn, 'en'),
};

// Prevent accidentally shipping partial translations of the original CV.
const ids = (resume: ResumeData) => resume.experiences.map(({ id }) => id).sort().join(',');
if (ids(resumes.pt) !== ids(resumes.en)) {
  throw new Error('Resume translations contain different experience IDs');
}
export const getResume = (lang: Lang): ResumeData => resumes[lang];
