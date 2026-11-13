import { z } from 'zod';

const Period = z.object({ start: z.string().min(1), end: z.string().nullable() });
export const ResumeSchema = z.object({
  summary: z.string().min(1),
  experiences: z.array(z.object({
    id: z.string().min(1),
    company: z.string().min(1),
    role: z.string().min(1),
    period: Period,
    description: z.array(z.string().min(1)).min(1),
    achievements: z.array(z.string()),
    technologies: z.array(z.string()),
  })).min(1),
  projects: z.array(z.object({
    title: z.string().min(1),
    category: z.enum(['academic', 'open-source', 'production']),
    description: z.string().min(1),
    technologies: z.array(z.string()),
    links: z.object({
      github: z.string().url().optional(),
      live: z.string().url().optional(),
      articleSlug: z.string().optional(),
    }),
  })),
  education: z.array(z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    period: Period,
  })).min(1),
  skills: z.array(z.object({ title: z.string(), items: z.array(z.string()) })),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
  softSkills: z.array(z.string()),
});
export type ResumeData = z.infer<typeof ResumeSchema>;
