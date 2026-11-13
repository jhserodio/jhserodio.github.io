import {
  ME_EMAIL as email,
  ME_GITHUB as github,
  ME_LINKEDIN as linkedin,
  ME_PHONE as phone,
  LEET_CODE as leetcode,
} from '../../helpers/constants'


export const meEn = {
  name: "Joao Henrique Serodio",
  employ: "Software Engineer",
  about: {
    title: "About me",
    bio: "I am a software developer with a broad skill set. My core expertise lies in Software Architecture and Full Stack Web Development using Node.js for backend and React for frontend. My programming journey began in 2006, and I completed my System Integration Degree at the University of Central Paraná between 2008 and 2012. Currently, I am pursuing a Mathematics degree, specializing in solving complex systems and seeking balance between academic and corporate life to reach new levels of intellectual capability. In recent years, I have been working more intensively with C, C++, and Rust, with ongoing focus on high-performance systems and WebAssembly."
  },
  contact: {
    title: "My Contacts and profiles",
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
      label: 'Number phone',
      value: phone
    },
    leetcode: {
      label: 'LeetCode',
      value: leetcode
    }
  },
  education: {
    title: "Formal Education",
    bachelor: "I pursued a System Information Degree at UCP (University of Central Parana), situated in the city of Pitanga in the state of Parana, Brazil, from 2008 to 2012.",
    current: "Currently pursuing a Bachelor's Degree in Applied Computational Mathematics (in progress)."
  }
}
