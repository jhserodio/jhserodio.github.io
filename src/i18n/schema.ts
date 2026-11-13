import { z } from 'zod';

const Period = z.object({ start: z.string(), end: z.string().nullable() });
export const ResumeSchema = z.object({
  summary: z.string(),
  experiences: z.array(z.object({
    id: z.string(), company: z.string(), role: z.string(),
    period: Period,
    description: z.array(z.string()),
    achievements: z.array(z.string()),
    technologies: z.array(z.string()),
  })),
  projects: z.array(z.object({
    title: z.string(),
    category: z.enum(['academic', 'open-source', 'production']),
    description: z.string(),
    technologies: z.array(z.string()),
    links: z.object({
      github: z.string().url().optional(),
      live: z.string().url().optional(),
      articleSlug: z.string().optional(),
    }),
  })),
  education: z.array(z.object({
    institution: z.string(), degree: z.string(), period: Period,
  })),
});
export type ResumeData = z.infer<typeof ResumeSchema>;
