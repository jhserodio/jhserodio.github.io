import type { Lang } from '../ui';

/**
 * Focused, source-backed CV enhancements. The original role chronology stays
 * in resume/{pt,en}. These statements were cross-checked against the seven
 * role-specific CVs provided in November 2026, keeping research and
 * in-progress projects distinct from deployed production systems.
 */
type ExperienceExtra = {
  description: string[];
  achievements?: string[];
  technologies?: string[];
};

export const summaries: Record<Lang, string> = {
  pt: 'Engenheiro de software e arquiteto com mais de 15 anos de experiência em produtos SaaS, fintech, e-commerce e sistemas distribuídos. Minha especialidade profissional é TypeScript, Node.js e React, aliada à liderança técnica de equipes e arquitetura orientada a eventos. Trabalho também com Rust em componentes de performance, modelos numéricos e integrações IoT. Estou cursando a segunda graduação em Matemática Aplicada Computacional na UNICENTRO, com foco em métodos numéricos, otimização, álgebra linear e pesquisa computacional. Busco unir engenharia de produção, fundamentos matemáticos e software de alto desempenho.',
  en: 'Software engineer and architect with 15+ years of experience across SaaS, fintech, e-commerce, and distributed systems. My primary professional stack is TypeScript, Node.js, and React, combined with technical leadership and event-driven architecture. I also build with Rust in performance-sensitive components, numerical models, and IoT integrations. I am pursuing a second bachelor’s degree in Applied Computational Mathematics at UNICENTRO, focusing on numerical methods, optimization, linear algebra, and computational research. My work connects production engineering, mathematical reasoning, and high-performance software.',
};

export const experienceExtras: Record<Lang, Record<string, ExperienceExtra>> = {
  pt: {
    boticario: {
      description: [
        'Atuei como Staff Architect e Tech Lead na direção técnica de três squads de produtos B2B e B2P, conciliando definição arquitetural, implementação, mentoria, revisão de código, qualidade e investigação de incidentes. Trabalhei com serviços distribuídos e fluxos orientados a eventos em Kotlin, Node.js/TypeScript, AWS EKS e Lambda, Kafka, SNS/SQS e DynamoDB.',
        'No Pedido Sugerido (Suggestion Order), projetei e implementei em Rust o modelo matemático de recomendação de reabastecimento: estimativas de Days on Hand (DOH), métodos estocásticos e aproximações numéricas para diferentes padrões de demanda, sazonalidade, regiões e ciclos de vida de produtos. Integrei o processamento ao ecossistema de pedidos, com arquitetura CQRS e serviços assíncronos, incluindo GCP Vertex AI.',
        'Também contribuí para a arquitetura do Portal de Vendas, combinando microfrontends React/Redux Toolkit, BFF, serviços Kotlin no EKS e integrações com SAP. No Integra, desenhei fluxos entre workers C# on-premises, APIs Node.js/AWS Lambda, webhooks, Kafka, MongoDB e data lake. Ajudei a estabelecer o alvo de 80% de cobertura unitária, testes de integração/E2E e diagnósticos distribuídos com New Relic.',
      ],
      achievements: [
        'A iniciativa de pedidos sugeridos reduziu o tempo do processo de aproximadamente uma semana para duas horas e elevou a adoção de clientes de 30% para 90%.',
      ],
      technologies: ['Rust', 'Matemática Aplicada', 'Métodos Estocásticos', 'Aproximação Numérica', 'Kotlin', 'CQRS', 'GCP Vertex AI', 'SNS'],
    },
    vnator: {
      description: [
        'Fundei e arquitetei uma plataforma white-label de e-commerce e CMS, mantendo atuação hands-on em APIs Node.js/NestJS e GraphQL, modelagem PostgreSQL, infraestrutura AWS EKS/Kubernetes e decisões de operação, implantação e evolução do produto.',
        'Desenvolvi componentes em Rust para distribuição de tráfego/CDN e processamento sensível a performance, explorando Axum e SQLx para lidar com consumo de recursos e gargalos. Também trabalhei com otimização de consultas, CI/CD e observabilidade.',
      ],
      technologies: ['Rust', 'Axum', 'SQLx', 'Kubernetes', 'AWS EKS', 'Performance'],
    },
    agrotis: {
      description: [
        'Atuei no time de arquitetura de uma plataforma agro, trabalhando em infraestrutura de mensagens Kafka e EMQX (Erlang/OTP), integração com dispositivos agrícolas, fluxos de event sourcing, Saga e Transactional Outbox, além da evolução de infraestrutura e monitoramento.',
        'Implementei clientes leves em Rust para dispositivos IoT e um módulo Rust/WebAssembly para cálculo de perímetros geográficos. Colaborei ainda com a modernização frontend, incluindo microfrontends e uma biblioteca compartilhada de componentes React.',
      ],
      technologies: ['Rust', 'WebAssembly', 'IoT', 'EMQX', 'Kafka', 'Erlang', 'React'],
    },
    kovi: {
      description: [
        'Desenvolvi serviços Node.js/NestJS e pipelines AWS Lambda para validação e autorização de locação de veículos, integrando verificações externas com persistência em PostgreSQL.',
        'Modelei as dependências entre operações como grafos acíclicos direcionados (DAGs), possibilitando executar etapas independentes em paralelo e coordenar fluxos assíncronos.',
      ],
      technologies: ['DAG', 'PostgreSQL', 'AWS Lambda'],
    },
    pagarme: {
      description: [
        'Atuei como referência técnica na modernização do dashboard operacional de uma fintech, migrando aplicações para microfrontends React/TypeScript usando Webpack Module Federation e separação de domínios.',
        'Contribuí com revisões arquiteturais, mentoria, padrões de integração com BFF e práticas para permitir evolução e deploy independentes por equipe.',
      ],
      technologies: ['Webpack Module Federation', 'Arquitetura de Microfrontends'],
    },
    pedePronto: {
      description: [
        'Atuei em funcionalidades de catálogo, pedidos e onboarding B2B/B2C com React, Redux, GraphQL e PostgreSQL, apoiando componentes de interface reutilizáveis.',
        'Contribuí para a migração gradual de um monólito Python/Flask para microsserviços, com serviços Java/Spring no AWS EKS e pipelines de eventos Node.js/TypeScript em AWS Lambda.',
      ],
      technologies: ['Java', 'Spring', 'AWS EKS', 'GraphQL', 'AWS Lambda'],
    },
  },
  en: {
    boticario: {
      description: [
        'Served as Staff Architect and Tech Lead across three B2B/B2P engineering squads, combining architecture direction, hands-on development, mentorship, code reviews, quality standards, and production troubleshooting. Worked on distributed and event-driven systems with Kotlin, Node.js/TypeScript, AWS EKS and Lambda, Kafka, SNS/SQS, and DynamoDB.',
        'For Suggestion Order, designed and implemented the Rust-based mathematical replenishment model: Days on Hand (DOH) estimation, stochastic methods, and numerical approximations across demand curves, seasonality, geography, and product lifecycles. Integrated the model with the ordering ecosystem using CQRS, asynchronous services, and GCP Vertex AI.',
        'Also contributed to the Sales Portal architecture with React/Redux Toolkit microfrontends, BFF, Kotlin on EKS, and SAP integrations. For Integra, designed integrations spanning on-premises C# workers, Node.js/AWS Lambda APIs, webhooks, Kafka, MongoDB, and a data lake. Helped establish an 80% unit-test coverage target, integration/E2E testing, and New Relic distributed tracing.',
      ],
      achievements: [
        'The Suggestion Order initiative reduced order-processing time from approximately one week to two hours and increased customer adoption from 30% to 90%.',
      ],
      technologies: ['Rust', 'Applied Mathematics', 'Stochastic Methods', 'Numerical Approximation', 'Kotlin', 'CQRS', 'GCP Vertex AI', 'SNS'],
    },
    vnator: {
      description: [
        'Founded and architected a white-label e-commerce/CMS platform, staying hands-on with Node.js/NestJS and GraphQL APIs, PostgreSQL data modeling, AWS EKS/Kubernetes infrastructure, and end-to-end engineering decisions.',
        'Built Rust components for CDN traffic distribution and performance-sensitive data processing, exploring Axum and SQLx to address resource consumption and processing bottlenecks. Also worked on query optimization, CI/CD, and observability.',
      ],
      technologies: ['Rust', 'Axum', 'SQLx', 'Kubernetes', 'AWS EKS', 'Performance'],
    },
    agrotis: {
      description: [
        'Worked with the architecture team of an agricultural SaaS platform on Kafka and EMQX (Erlang/OTP) messaging infrastructure, agricultural-device integrations, event-sourcing, Saga and Transactional Outbox workflows, and operational infrastructure.',
        'Built lightweight Rust clients for IoT devices and a Rust/WebAssembly module for geographic perimeter calculations. Also contributed to microfrontend modernization and a shared React component library.',
      ],
      technologies: ['Rust', 'WebAssembly', 'IoT', 'EMQX', 'Kafka', 'Erlang', 'React'],
    },
    kovi: {
      description: [
        'Developed Node.js/NestJS services and AWS Lambda pipelines for vehicle rental verification and authorization, integrating third-party checks with PostgreSQL persistence.',
        'Modeled operation dependencies as directed acyclic graphs (DAGs), allowing independent serverless stages to execute concurrently within coordinated asynchronous workflows.',
      ],
      technologies: ['DAG', 'PostgreSQL', 'AWS Lambda'],
    },
    pagarme: {
      description: [
        'Served as a technical reference during the modernization of a fintech operations dashboard, moving applications to React/TypeScript microfrontends using Webpack Module Federation and clearer domain boundaries.',
        'Contributed architecture reviews, mentoring, BFF integration practices, and engineering guidelines supporting independent team delivery and deployment.',
      ],
      technologies: ['Webpack Module Federation', 'Microfrontend Architecture'],
    },
    pedePronto: {
      description: [
        'Delivered catalog, ordering, and B2B/B2C onboarding features using React, Redux, GraphQL, and PostgreSQL, while supporting reusable frontend components.',
        'Helped gradually decompose a Python/Flask monolith into microservices, working with Java/Spring services on AWS EKS and Node.js/TypeScript AWS Lambda event pipelines.',
      ],
      technologies: ['Java', 'Spring', 'AWS EKS', 'GraphQL', 'AWS Lambda'],
    },
  },
};

type ProjectExtra = { description: string; highlights: string[]; technologies?: string[] };

export const projectExtras: Record<Lang, Record<string, ProjectExtra>> = {
  pt: {
    'Quantitative Developer Roadmap': {
      description: 'Iniciativa open source que une minha segunda graduação em Matemática Aplicada Computacional à engenharia de software. Organizei 237 exercícios em quatro etapas — fundamentos, métodos numéricos/estatísticos, finanças quantitativas e computação avançada — com implementações incrementais em Rust e C.',
      highlights: [
        'Implementações e testes para algoritmos de teoria dos números, combinatória, busca e otimização, além de métodos numéricos como trapézios e Simpson.',
        'Ênfase em provas matemáticas, limites numéricos, casos extremos, complexidade e testes automatizados; o catálogo é um roteiro de desenvolvimento, não 237 soluções concluídas.',
        'A série de artigos Math with Rust documenta a fundamentação e as decisões de implementação.',
      ],
      technologies: ['Numerical Analysis', 'Number Theory', 'Algorithms', 'TDD'],
    },
    'vim-grimory': {
      description: 'Configuração pessoal e reproduzível do Neovim para desenvolvimento, com foco em ergonomia, ferramentas de linguagem e controle explícito das funcionalidades de IA.',
      highlights: [
        'Ambiente customizado com Lua e configuração de editor/LSP para o fluxo diário de engenharia.',
        'Exploração de integração opcional com ferramentas locais de programação assistida por IA, sem depender de sugestões automáticas permanentes.',
      ],
      technologies: ['Lua', 'LSP', 'AI Tooling'],
    },
    'Vision Transformer Optimization — Scientific Research': {
      description: 'Pesquisa acadêmica em andamento sobre otimização algorítmica e numérica de Vision Transformers para análise de imagens histológicas de carcinoma espinocelular oral (OSCC).',
      highlights: [
        'Investigo estratégias para reduzir o custo de inferência, com fundamentos em álgebra linear, métodos numéricos e representação de matrizes.',
        'Exploro implementação e experimentação GPU com Rust, Candle e CUDA; não há ganho de performance validado ou modelo clínico concluído anunciado.',
      ],
      technologies: ['Linear Algebra', 'GPU Computing', 'OSCC Histology'],
    },
    'Self-hosted Qwen Code Agent': {
      description: 'Laboratório local de agentes de código com Node.js, modelos Qwen via Ollama e recuperação de contexto com Qdrant, conectado ao fluxo de desenvolvimento em Neovim.',
      highlights: [
        'Experimentos com consulta contextual ao repositório, revisão de código e propostas de alteração submetidas à aprovação explícita.',
        'Pesquisa de integração entre ferramentas, busca semântica e inferência local para manter o desenvolvedor no controle do processo.',
      ],
      technologies: ['AI Agents', 'Local Inference', 'Developer Tooling'],
    },
    'Capacitated Vehicle Routing — Deterministic to Stochastic': {
      description: 'Modelagem matemática de um problema de roteamento de veículos com capacidade limitada (CVRP), investigando formulações determinísticas e sua futura extensão para demanda incerta.',
      highlights: [
        'Formulação em andamento com programação inteira mista (MILP), programação dinâmica e restrições de capacidade e distância.',
        'Próxima etapa planejada: estudar extensões estocásticas para cenários de entregas de redes de restaurantes; não é apresentado como solver concluído.',
      ],
      technologies: ['Mathematical Optimization', 'Stochastic Modeling', 'Combinatorial Optimization'],
    },
  },
  en: {
    'Quantitative Developer Roadmap': {
      description: 'Open-source initiative connecting my second degree in Applied Computational Mathematics with software engineering. I organized 237 exercises into four stages: foundations, numerical/statistical methods, quantitative finance, and advanced computing, with incremental Rust and C implementations.',
      highlights: [
        'Implementations and tests cover number theory, combinatorics, searching and optimization, and numerical methods including trapezoidal and Simpson integration.',
        'Emphasis on mathematical foundations, numeric limits, edge cases, complexity, and automated testing; the 237-item catalog is a roadmap, not a claim that every solution is complete.',
        'The Math with Rust article series explains the underlying mathematics and implementation trade-offs.',
      ],
      technologies: ['Numerical Analysis', 'Number Theory', 'Algorithms', 'TDD'],
    },
    'vim-grimory': {
      description: 'Personal, reproducible Neovim environment focused on development ergonomics, language tooling, and explicit control over AI-assisted features.',
      highlights: [
        'Customized Lua-based editor/LSP setup for day-to-day software development.',
        'Exploring optional integrations with local AI coding tools without always-on automated suggestions.',
      ],
      technologies: ['Lua', 'LSP', 'AI Tooling'],
    },
    'Vision Transformer Optimization — Scientific Research': {
      description: 'Ongoing academic research into numerical and algorithmic optimization of Vision Transformers for oral squamous cell carcinoma (OSCC) histological image analysis.',
      highlights: [
        'Investigating ways to reduce inference cost using linear algebra, numerical methods, and matrix representations.',
        'Exploring GPU-based experimentation with Rust, Candle, and CUDA; no validated performance gains or completed clinical model are claimed.',
      ],
      technologies: ['Linear Algebra', 'GPU Computing', 'OSCC Histology'],
    },
    'Self-hosted Qwen Code Agent': {
      description: 'Local-first coding-agent lab combining Node.js, Qwen models served through Ollama, and Qdrant-backed context retrieval, connected to a Neovim development workflow.',
      highlights: [
        'Experimenting with contextual codebase questions, code review, and explicit approval of proposed changes.',
        'Exploring tool integration, semantic search, and on-device inference while preserving developer control.',
      ],
      technologies: ['AI Agents', 'Local Inference', 'Developer Tooling'],
    },
    'Capacitated Vehicle Routing — Deterministic to Stochastic': {
      description: 'Mathematical modeling of the Capacitated Vehicle Routing Problem (CVRP), exploring deterministic formulations and a future extension to uncertain demand.',
      highlights: [
        'Work-in-progress formulation with mixed-integer linear programming (MILP), dynamic programming, and capacity/distance constraints.',
        'Planned next step: stochastic extensions for restaurant-chain delivery scenarios; this is not presented as a completed solver.',
      ],
      technologies: ['Mathematical Optimization', 'Stochastic Modeling', 'Combinatorial Optimization'],
    },
  },
};
