 export const resumePt = {
  title: 'Skills',
  softSkills: {
    title: 'Soft Skills',
    feedback: "Feedback Estruturado",
    responsability: "Forte senso de Responsabilidade",
    comunication: "Comunicação Transparente",
    knowledge: "Amor por aprender",
    agile: "Agile, Scrum e kanban",
  },
  langs: {
    title: 'Idiomas',
    portuguese: {
      label: 'Portugues',
      level: 'Nativo'
    },
    english: {
      label: 'Ingles',
      level: 'Avançado com boa escrita e conversação e proeficiencia na área de tecnológica.'
    }
  },
  stack: {
    title: 'Hard Skills',
    label: {
      level: 'Knowledgement level',
      years: 'Years worked'
    },
    developer: {
      label: 'Developer Skills',
      aws: {
        label: 'Amazon Web Service',
        level: 6,
        years: 5,
        sub: {
          cloudformation: 'Cloudformation',
          apiGateway: 'API Gateway',
          amplify: 'Amplify',
          cloudfront: 'Cloudfront',
          cloudwatch: 'cloudwatch',
          cognito: 'Cognito',
          route53: 'Route53',
          lambda: 'Lambda',
          ec2: 'EC2',
          s3: 'S3',
          eventBridge: 'Event Bridge',
          stepFunctions: 'Step Functions'
        }
      },
      firebase: {
        label: 'Firebase',
        level: 6,
        years: 2,
        sub: {
          Functions: 'Firebase Functions',
          realtimeDB: 'Real Time Database',
          auth: 'Firebase Auth',
          hosting: 'Firebase hosting',
        }
      },
      linux: {
        label: 'Linux',
        level: 7,
        years: 14,
      },
      docker: {
        label: 'Docker',
        level: 7,
        years: 5,
      },
      kubernetes: {
        label: 'Kubernetes e AWS EKS',
        level: 7,
        years: 4,
        sub: {
          eks: 'AWS EKS (Elastic Kubernetes Service)',
          helm: 'Helm Charts',
          deployments: 'Deployments e Services',
          ingress: 'Ingress Controllers',
        }
      },
      gcp: {
        label: 'Google Cloud Platform',
        level: 5,
        years: 2,
        sub: {
          vertexAI: 'Vertex AI (Machine Learning)',
          bigQuery: 'BigQuery',
        }
      },
      cAndCpp: {
        label: 'C and C++ Programming Languages',
        level: 6,
        years: 3,
        sub: {
          algorithms: 'Algoritmos de Busca e Ordenação',
          dataStructures: 'Árvores, Grafos, Hash Maps',
          greedy: 'Algoritmos Gulosos',
          linkedLists: 'Listas Ligadas',
          matrices: 'Matrizes e Matrizes Esparsas',
        }
      },
      git: {
        label: 'git',
        level: 8,
        years: 12,
      },
      tdd: {
        label: 'TDD (Testing Driven Development)',
        level: 8,
        years: 6,
      },
      newRelic: {
        label: 'New Relic',
        level: 6,
        years: 3,
      },
      sentry: {
        label: 'Sentry',
        level: 7,
        years: 3,
      },
      elk: {
        label: 'Elastic Stack (ELK)',
        level: 6,
        years: 5,
      },
      workflow: {
        label: 'Gitflow and Forked Flow',
        level: 8,
        years: 7,
      },
      cicd: {
        label: 'Continuous integration, delivery',
        level: 8,
        years: 8,
        sub: {
          bitbucket: 'Bitbucket Pipelines',
          circleCi: 'Circle CI',
          githubActions: 'Github Actions',
          jenkins: 'Jenkins',
        }
      },
      ddd: {
        label: 'DDD (Domain Driven Design)',
        level: 6,
        years: 8,
      },
      bdd: {
        label: 'BDD (Behavior Driven Development)',
        level: 5,
        years: 4,
      },
      graphQL: {
        label: 'GraphQL APIs',
        level: 7,
      years: 5,
      },
      rest: {
        label: 'Rest APIs',
        level: 8,
        years: 10,
      },
      fp: {
        label: 'Functional Programing',
        level: 8,
        years: 9,
      },
      oop: {
        label: 'OOP (Object Oriented Programing)',
        level: 8,
        years: 14,
      },
      microservices: {
        label: 'Micro Services',
        level: 6,
        years: 7,
      },
      microfrontends: {
        label: 'Micro Front-ends',
        level: 8,
        years: 7,
      },
    },
    frontend: {
      label: 'Front-end Skills',
      js: {
        label: 'Javascript ES2015++',
        level: 10,
        years: 16,
      },
      html: {      
        label: 'HTML (Hyper Text Markup Language)',
        level: 10,
        years: 16,
        sub: {
          html5: 'HTML5',
          semanticHtml: 'Semantic HTML',
        }
      },
      css: {
        label: 'CSS (Cascade Style Sheet)',
        level: 10,
        years: 16,
        sub: {
          css3: 'CSS3',
          flexbox: 'Flexbox',
          grid: 'Native Layout Grid',
          postCSS: 'PostCSS',
          cssModules: 'CSS Modules',
          sass: 'SASS',
          cssJs: 'CSS in Js',
          styledComponents: 'Styled components',
          stitches: 'Stitches',
        }
      },
      typescript: {
        label: 'Typescript',
        level: 9,
        years: 5,
      },
      shopify: {
        label: 'Shopify Liquid',
        level: 8,
        years: 4,
      },
      astro: {
        label: 'Astro SSG (Static Site Generator)',
        level: 8,
        years: 2,
      },
      nextJS: {
        label: 'NextJS (Server Side Rendering)',
        level: 8,
        years: 7,
      },
      elm: {
        label: 'Elm Template Engine Language',
        level: 7,
        years: 3,
      },
      wasm: {
        label: 'Web Assembly (WASM)',
        level: 6,
        years: 4,
      },
      angular: {
        label: 'Angular',
        level: 7,
        years: 6,
      },
      i18n: {
        label: 'i18n and FormatJs',
        level: 9,
        years: 8,
      },
      reactJs: {
        label: 'ReactJs',
        level: 10,
        years: 10,
        sub: {
          hooks: 'React Hooks',
          intl: 'React Intl and React i18n',
          mobx: 'Mobx',
          redux: 'Redux',
          rtk: 'Redux ToolKit RTK (State manange and data fetch)',
          reduxThunks: 'Redux thunks',
          reduxSagas: 'Redux Sagas',
        }
      },
      tests: {
        label: 'Tests Automation',
        level: 9,
        years: 8,
        sub: {
          jest: 'Jest',
          testingLibrary: 'Testing Library',
          enzyme: 'Enzyme',
          sinon: 'Sinon',
          cypres: 'Cypres',
        }
      },
      engineering: {
        label: 'Front-end Engineering',
        level: 8,
        years: 12,
        sub: {
          webpack: 'Webpack',
          moduleFederation: 'webpack module Federation',
          npm: 'npm and npm workspace',
          yarn: 'Yarn and Yarn workspace',
          lerna: 'Lerna monorepo orchestry',
          turboPack: 'Turbo pack',
          turboRepo: 'Turbo Repo',
          eslint: 'ESLint',
          prettier: 'Prettier',
          rome: 'Rome',
          grunt: 'Grunt',
          yeoman: 'Yeoman',
          bower: 'Bower'
        }
      },
      designSystems: {
        label: 'Design Systems',
        level: 9,
        years: 10,
        sub: {
          responsive: 'Responsive Design',
          atomic: 'Atomic Design',
          materialUI: 'Material UI',
          tailwind: 'Tailwind',
          bootstrap: 'Bootstrap',
          chackraUI: 'Chackra UI'
        }
      },
      dataFetch: {
        label: 'Data Fetch',
        level: 9,
        years: 12,
        sub: {
          mqtt: 'MQTT',
          socketIo: 'Socket.io',
          webSockets: 'Web Sockets',
          rest: 'Rest APIs',
          graphQL: 'GraphQL APIs',
        },
      },
      workers: {
        label: 'Web Workers',
        level: 6,
        years: 4,
      },
      chromeExtension: {
        label: 'Chrome Extension',
        level: 5,
        years: 2,
      },
      firefoxAddon: {
        label: 'Firefox Addon',
        level: 5,
        years: 2,
      },
    },
    backend: {
      label: 'Back-end Skills',
      node: {
        label: 'NodeJS and NodeTs',
        level: 9,
        years: 12,
        sub: {
          apollo: 'Apollo Server',
          nest: 'NestJS',
          loopback: 'Loopback',
          express: 'Express',
          typeORM: 'TypeORM',
          sequelize: 'Sequelize',
          sails: 'Sails',
          waterlime: 'Waterlime',
          serverless: 'Serverless',
        }
      },
      deno: {
        label: 'Deno Typescript Runtime',
        level: 8,
        years: 2,
        sub: {
          oak: 'Oak',
          fresh: 'Fresh',
          lume: 'Lume',
          cac: 'cac'
        }
      },
      Rust: {
        label:  'Rust Programing Language',
        level: 6,
        years: 4,
        sub: {
          rocket: 'Rocket',
          actix: 'Actix',
          tokio: 'Tokio',
          juniper: 'Juniper',
          diesel: 'Diesel ORM',
          sea: 'Sea ORM',
          yew: 'Yew',
          clap: 'Clap',
          ratatui: 'Ratatui',
        }
      },
      java: {
        label: 'Java 8++',
        level: 6,
        years: 8,
        sub: {
          jboss: 'Jboss Enterprise Application',
          jUnit: 'JUnit',
          spring: 'Spring boot MVC Framework',
          hHibernate: 'Hibernate',
        }
      },
      csharp: {
        label: 'C# and .NET',
        level: 6,
        years: 3,
        sub: {
          aspnet: 'ASP.NET Core',
          entityFramework: 'Entity Framework',
        }
      },
      kotlin: {
        label: 'Kotlin',
        level: 6,
        years: 2,
        sub: {
          springBoot: 'Spring Boot with Kotlin',
          coroutines: 'Kotlin Coroutines',
        }
      },
      awsServices: {
        label: 'AWS Data Services',
        level: 7,
        years: 3,
        sub: {
          glue: 'AWS Glue (ETL)',
          sqs: 'SQS (Simple Queue Service)',
          sns: 'SNS (Simple Notification Service)',
        }
      },
      postgreSQL: {
        label: 'PostgreSQL Database',
        level: 7,
        years: 8,
      },
      dynamoDB: {
        label: 'DynamoDB',
        level: 6,
        years: 2,
      },
      mongoDB: {
        label: 'MongoDB',
        level: 7,
        years: 4,
      },
      redis: {
        label: 'Redis in Memory Database',
        level: 5,
        years: 4,
      },
      kafka: {
        label: 'Apache Kafka',
        level: 6,
        years: 3,
      },
      rabbitMq: {
        label: 'Rabbit Mq',
        level: 6,
        years: 3,
      },
    }
  },
  jobs: {
    title: 'Jobs',
    label: {
      company: 'Empresa',
      employ: 'cargo: ',
      date: 'data trabalhada: ',
      finished: 'Finalizado em: ',
      describe: 'Descrição: '
    },
    boticario: {
      company: 'GRUPO BOTICÁRIO',
      employ: 'Tech Lead and Architect',
      started: 'entre 05/2024',
      finished: ' até hoje',
      describe: 'Como Tech Lead and Architect no Grupo Boticário, lidero tecnicamente três produtos estratégicos que impactam diretamente o ecossistema de vendas e tomada de decisão, definindo padrões arquiteturais, mentorando equipes múltiplas e garantindo escalabilidade, performance e resiliência em todos os sistemas.\n\nNo Integra, arquitetei uma solução robusta de ingestão de dados utilizando C# e Node.js com NestJS, implementando múltiplas estratégias de coleta que incluem aplicações on-premise integradas com ERPs legacy como SAP e Wintor, APIs para coleta via webhooks e integrações com ERPs cloud-native. A arquitetura roda sobre AWS EKS, utilizando Apache Kafka para processamento de eventos em tempo real, Redis para cache distribuído, e persistência híbrida com MongoDB e PostgreSQL, enriquecendo análises e decisões corporativas.\n\nNo Pedido Sugerido, desenvolvi um sistema de sugestão de pedidos B2B e B2P construindo uma arquitetura baseada em microsserviços com Node.js no backend e React no frontend. Implementei pipelines de Big Data utilizando AWS Glue para ETL, AWS Lambda para processamento serverless, orquestrando tudo sobre AWS EKS com comunicação assíncrona via SQS e SNS. O sistema utiliza GCP Vertex AI para modelos de machine learning aplicando análises matemáticas e inferências estatísticas avançadas, com persistência em MongoDB, otimizando compras de alto capital e reduzindo significativamente o tempo de realização de pedidos enquanto se adapta à melhor estratégia de venda de cada cliente.\n\nNo Portal de Vendas, lidero a arquitetura de uma plataforma B2B e B2P híbrida, combinando microsserviços em Kotlin rodando sobre AWS EKS com funções serverless em Node.js/TypeScript via AWS Lambda. O frontend em React consome APIs REST e GraphQL, integrando diversos ERPs para processar compras de parceiros estratégicos. Implementei uma arquitetura de persistência poliglota utilizando MongoDB para dados não estruturados, PostgreSQL para transações críticas e DynamoDB para alta disponibilidade, com comunicação entre serviços via Apache Kafka, SQS e SNS, fornecendo ferramentas avançadas de acompanhamento e previsibilidade de reabastecimento.',
    },
    vnator: {
      company: 'VNATOR',
      employ: 'Software Archtect e Founder',
      started: 'entre 11/2018',
      finished: ' até hoje',
      describe: 'Análise, arquitetura e implementação de uma plataforma de ecommerce para comercialização de arquivos digitais, utilizando a cloud da AWS, com serviço lambda em node, expondo um API Graphql utilizando Apollo Server, Aurora RDS PostgreSQL, CloudFormation para gestão e controle dos serviços bem como seus devidos parâmetros, Cognito e IAM para controle de acesso a plataforma, AWS S3 para armazenamento de forma dinâmica dos conteúdos da plataforma, desenvlvimento de SPA React, aplicação AWS EventBridge para gestao do fluxo de eventos, desenvolvimento de lambda layers para aplicação de dependencias e estratégia de isolamento da camada do ORM.',
    },
    nzn: {
      company: 'NZN',
      employ: 'Tech Lead',
      started: 'entre 10/2022',
      finished: ' até 07/2023.',
      describe: "Na posição de Arquiteto e Líder Tecnológico com Node.js, LoopBack, Strapi e Next.js em nossa plataforma, executando sobre um servidor Kubernetes, lidero o design estratégico e a gestão de equipes de desenvolvedores focadas em produtos editoriais. Sou responsável por criar padrões arquiteturais, projetar sistemas escaláveis e liderar a adoção de tecnologias. Meu papel envolve supervisionar a dinâmica da equipe, garantir altos padrões de desenvolvimento e implementar estratégias de automação para otimizar fluxos de trabalho. Dou prioridade à documentação de decisões arquiteturais e processos de desenvolvimento, garantindo clareza e compartilhamento de conhecimento. Além disso, avalio e integro tecnologias emergentes no ecossistema Node.js e frameworks relacionados, impulsionando a inovação. Minha dedicação está em fornecer soluções de alta qualidade e escaláveis por meio da colaboração efetiva da equipe e melhoria contínua."
    },
    pagarme: {
      company: 'PAGAR.ME',
      employ: 'Staff Front-End Software Engineer',
      started: 'entre 12/2022',
      finished: ' até 07/2023.',
      describe: 'Análise, arquitetura e desenvolvimento da plataforma microfrontend de dashboard PAGAR.ME. Desenvolvimento de novas funcionalidades e manutenção das soluções existentes, com migração dos produtos para um padrão de desenvolvimento baseado em microfronends com Typescript, React e Redux, consumindo APIs BFF.',
    },
    kovi: {
      company: 'KOVI',
      employ: 'Back-end Software Engineer Senior',
      started: 'entre 05/2022',
      finished: ' até 12/2022.',
      describe: 'Desenvolvedor Backend NodeJS(typescript), Análise e desenvolvimento de serverless function e lambda pipelines em NestJS e Express para um produto focado em aluguel e compra de veículos remotamente.'
    },
    pedePronto: {
      company: 'PEDE PRONTO',
      employ: 'Software Engineer Senior',
      started: 'entre 06/2020',
      finished: ' até 06/2022.',
      describe: 'Análise, Arquitetura e Desenvolvimento da aplicação pede pronto. Atuei no desenvolvimento e manutenabilidade da solução e participei da migração da arquitetura de monolito para pulverização em micro-serviços, implementei o client web focado em B2C (Business to Busines), e o serviço de onboarding para entrada de novos clientes no domínio de onBoarding do backend e frontend no B2B (Business to Business).'
    },
    agrotis: {
      company: 'AGROTIS',
      employ: 'Front-end Software Architect',
      started: 'entre 07/2016',
      finished: ' até 07/2019.',
      describe: 'Responsável pelo setor de desenvolvimento frontend do time de arquitetura, definições de arquitetura da plataforma Agrotis, desenvolvimento ferramentas e automação de processos. Assim como análise, arquitetura, desenvolvimento e gestão das aplicações que eram responsabilidade do time de arquitetura, trabalhei com diversas linguagens como Erlang, Python, Node, Java, até mesmo shellScript quando havia necessidade de implantar rotinas servidores ou desenvolver ferramentas de integração.'
    },
    polvo: {
      company: 'Polvo Digital',
      employ: 'Lead Front-end Developer',
      started: 'entre 07/2015',
      finished: ' até 06/2016.',
      describe: 'Responsável pelo setor de desenvolvimento e definição de tecnologias frontend, assim como pelo time de desenvolvimento frontend que era composto desenvolvedores frontend e designers.      '
    },
    freelance: {
      company: 'Freelancer Developer',
      employ: 'fullstack developer',
      started: 'entre 01/2011',
      finished: ' até 08/2015.',
      describe: 'Desenvolvimento autonomo em diversos projetos como desenvolvedor java ou NodeJS. E com angular, jquery ou JSF como frontend frontend.'
    },
  },
  interests: {
    title: 'Meus interesses',
    Basktball: 'Basquete',
    survivalist: 'Sobrevivencialismo',
    book: 'Livros <3',
    hq: 'HQs e mangas',
    videoGame: 'Video Games',
    movie: 'Filmes e Series',
    ranch: 'Fazenda e Cavalos',
    cook: 'Cozinhar e churrasco',
  },
}
