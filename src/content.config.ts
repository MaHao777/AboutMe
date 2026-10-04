import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const shared = {
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  published: z.boolean().default(false),
};

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...shared,
    role: z.string(),
    technologies: z.array(z.string()),
    cover: z.string().optional(),
    github: z.url().optional(),
    paper: z.url().optional(),
    demo: z.url().optional(),
    featured: z.boolean().default(false),
    status: z.enum(['ongoing', 'completed', 'archived']),
  }),
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...shared,
    category: z.enum(['思考', '生活', '技术', '随笔']),
    readingMinutes: z.number().int().positive().optional(),
  }),
});

export const collections = { projects, notes };
