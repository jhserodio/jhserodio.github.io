import {
  COMPANY_NAME as companyName,
  COMPANY_RESPONSABLE as companyResponsable,
  COMPANY_POSITION as companyPosition
} from '../../helpers/constants'

export const coverLetterPt = {
  hi: `Olá ${companyResponsable ?? companyName}`,
  apresentation: `Escrevo para expressar meu interesse nesta posição como ${companyPosition} na ${companyName}. Acredito que minha experiência em Arquitetura de Software, Full Stack Web Development e liderança técnica pode ser uma grande aquisição para a empresa.`,
  paragraphs: {
    first: 'Sou um desenvolvedor generalista/especialista (Pi Shaped) com expertise principal em Arquitetura de Software e Full Stack Web Development utilizando Node.js no backend e React no frontend. Minha jornada na programação começou em 2006, e entre 2008 e 2012 concluí minha graduação em Sistemas de Informação na Universidade do Centro do Paraná. Atualmente, atuo como Tech Lead and Architect no Grupo Boticário, liderando tecnicamente três produtos estratégicos. Paralelamente, estou cursando Matemática Aplicada Computacional, especializando-me em resolução de sistemas complexos e buscando equilíbrio entre vida acadêmica e corporativa para alcançar novos patamares intelectuais. Nos últimos anos, tenho trabalhado intensamente com C, C++ e Rust, focando em algoritmos avançados, estruturas de dados e sistemas de alta performance.',
    second: 'Ao longo da minha carreira, trabalhei em diversas indústrias: agronegócio, aluguel de veículos, delivery, e-commerce, marketplaces e varejo. Tenho vasta experiência com arquitetura de microsserviços, micro frontends, SPAs, BFF, integrações complexas de ERPs (SAP, Wintor), orquestração com Kubernetes/EKS, mensageria (Kafka, SQS, SNS), Big Data e machine learning (AWS Glue, GCP Vertex AI). Trabalhei com tecnologias desde C#, Java, Kotlin até Node.js, React e Rust, sempre focando em escalabilidade, performance e resiliência.',
    third: 'Sobre mim, posso dizer que minha curiosidade, paixão por conhecimento e forte senso de responsabilidade são meus pilares. Amo aprender coisas novas e trabalhar com desafios complexos, mas acredito que a melhor escolha para qualquer projeto é a tecnologia necessária, não necessariamente a mais popular. Meu foco atual está em unir conhecimento matemático avançado com expertise técnica para resolver problemas cada vez mais complexos.',
  },
  by: `Obrigado ${companyResponsable ?? companyName} e tenha um ótimo dia.`
}
