import { LTDA } from '../../constants/ltda';

const jobs_ptBR = {
  title: 'Work experience',
  [LTDA.VNATOR]: {
    company: 'VNATOR',
    employ: 'Arquitetura, Analise e Desenvolvimento de Software',
    date: 'Início em Novembro de 2018 ate hoje',
    description:
      'Desenvolvimento de uma plataforma de ecommerce para comercialização de arquivos digitais, utilizando a nuvem da AWS, com serviço lambda em node, expondo um API Graphql utilizando Apollo, Aurora RDS PostgreSQL, CloudFormation para gestão e controle dos serviços bem como seus devidos parâmetros, Cognito e IAM para controle de acesso a plataforma, AWS S3 para armazenamento de forma dinâmica dos conteúdos subidos para a plataforma, disponibilização do SPA escrito em React no CDN da AWS, AWS EventBridge para controle de algumas ações através de eventos, lambda layer com binários relevantes para algumas funções lambda. Prestação de serviço em desenvolvimento de software e manutenção de sistemas.',
  },
  [LTDA.CINQ]: {
    company: 'CINQ',
    employ: 'Software Engineer Senior',
    date: 'Entre Fevereiro de 2020 a maio de 2020',
    description:
      'Desenvolvedoar Frontend e Tech leader do produto Ticket Shop v2 da Ticket do Brasil - Endered.',
  },
  [LTDA.AGROTIS]: {
    company: 'Agrotis',
    employ: 'Software Architectt',
    date: 'Entre Setembro de 2016 e Junho de 2019',
    description:
      'Responsável pelo setor de desenvolvimento frontend do time de arquitetura, definições de arquitetura da plataforma Agrotis, desenvolvimento ferramentas e automação de processos. Assim como análise, arquitetura, desenvolvimento e gestão das aplicações que eram responsabilidade do time de arquitetura, trabalhei com diversas linguagens como Erlang, Python, Node, Java, até mesmo shellScript quando havia necessidade de implantar rotinas servidores ou desenvolver ferramentas de integração.',
  },
  [LTDA.NAYP]: {
    company: 'NAYP',
    employ: 'Analista e Desenvolvedor Web',
    date: 'Início em Julho de 2019 ate hoje',
    description:
      'Análise e desenvolvimento das aplicações web da NAYP, como e-comerce das marcas de roupa ARVST e NoClass.',
  },
  [LTDA.POLVO]: {
    company: 'Polvo Digital',
    employ: 'Frontend web',
    date: 'Entre Agosto de 2015 e Junho de 2016',
    description:
      'Responsável pelo setor de desenvolvimento e definição de tecnologias frontend, assim como pelo time de desenvolvimento frontend que era composto desenvolvedores frontend e designers.',
  },
  [LTDA.FREELANCER]: {
    company: 'Freelancer Developer',
    employ: 'Web Developer',
    date: 'Entre Janeiro de 2011 e Novembro de 2018',
    description:
      'Desenvolvimento autonomo em diversos projetos como frontend, desenvolvedor java, nodeJs ou Haskell',
  },
};

export { jobs_ptBR };
