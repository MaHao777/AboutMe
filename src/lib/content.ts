import { getCollection } from 'astro:content';

export async function getPublicProjects() {
  const entries = await getCollection('projects', ({ data }) => data.published === true);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublicNotes() {
  const entries = await getCollection('notes', ({ data }) => data.published === true);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}
