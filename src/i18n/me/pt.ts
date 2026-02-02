import {
  ME_EMAIL as email,
  ME_GITHUB as github,
  ME_LINKEDIN as linkedin,
  ME_PHONE as phone,
  LEET_CODE as leetcode
} from '../../helpers/constants'


export const mePt = {
  name: "Joao Henrique Serodio",
  employ: "Software Engineer",
  about: {
    title: "Sobre mim",
    bio: "Sou um desenvolvedor de software generalista/especialista (Pi Shaped), com expertise principal em Arquitetura de Software e Full Stack Web Development utilizando Node.js no backend e React no frontend. Comecei a programar em 2006 e entre 2008 e 2012 concluí minha graduação em Sistemas de Informação na Universidade do Centro do Paraná. Atualmente, estou cursando Matemática, me especializando em resolução de sistemas complexos e buscando o equilíbrio entre a vida acadêmica e corporativa para alcançar novos patamares nas minhas capacidades intelectuais. Nos últimos anos, tenho trabalhado mais intensamente com C, C++ e Rust, com foco contínuo em sistemas de alta performance e WebAssembly."
  },
  contact: {
    title: "Meus Contatos",
    email:  {
      label: 'E-mail',
      value: email
    },
    github: {
      label: "Github",
      value: github
    },
    linkedin: {
      label: "Linkedin",
      value: linkedin
    },
    numberPhone: {
      label: 'Número de telefone',
      value: phone
    },
    leetcode: {
      label: 'LeetCode',
      value: leetcode
    }
  },
  education: {
    title: "Formação Acadêmica",
    bachelor: "Bacharel em Sistemas de Informação pela UCP - Pitanga (Univerdade do Centro do Paraná), entre 2008 e 2012.",
    current: "Cursando Bacharel em Matemática Aplicada Computacional (em andamento)."
  }
}
