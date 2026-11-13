import {
  COMPANY_NAME as companyName,
  COMPANY_RESPONSABLE as companyResponsable,
  COMPANY_POSITION as companyPosition
} from '../../helpers/constants'

export const coverLetterEn = {
  title: `Cover Letter`,
  hi: `Hi ${companyResponsable ?? companyName}`,
  presentation: `I am writing to express my interest in this position as ${companyPosition} at ${companyName}. I believe that my experience in Software Architecture, Full Stack Web Development, and technical leadership can be a great asset for the company.`,
  paragraphs: {
    first: "I am a generalist/specialist software developer (Pi Shaped) with core expertise in Software Architecture and Full Stack Web Development using Node.js for backend and React for frontend. My programming journey began in 2006, and between 2008 and 2012, I completed my System Integration Degree at the University of Central Paraná. Currently, I work as Tech Lead and Architect at Grupo Boticário, technically leading three strategic products. In parallel, I am pursuing a degree in Applied Computational Mathematics, specializing in solving complex systems and seeking balance between academic and corporate life to reach new levels of intellectual capability. In recent years, I have been working intensively with C, C++, and Rust, focusing on advanced algorithms, data structures, and high-performance systems.",
    second: "Throughout my career, I've worked across various industries: agribusiness, car rental, food delivery, e-commerce, marketplaces, and retail. I have extensive experience with microservices architecture, micro frontends, SPAs, BFF, complex ERP integrations (SAP, Wintor), orchestration with Kubernetes/EKS, messaging systems (Kafka, SQS, SNS), Big Data, and machine learning (AWS Glue, GCP Vertex AI). I've worked with technologies ranging from C#, Java, Kotlin to Node.js, React, and Rust, always focusing on scalability, performance, and resilience.",
    third: "About me, I can say that my curiosity, passion for knowledge, and strong sense of responsibility are my pillars. I love learning new things and working with complex challenges, but I believe that the best choice for any project is the necessary technology, not necessarily the most popular one. My current focus is on combining advanced mathematical knowledge with technical expertise to solve increasingly complex problems.",
  },
  by: "Thank you for taking the time to read this, and have a great day."
}
