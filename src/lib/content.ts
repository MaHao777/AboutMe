import { getCollection } from 'astro:content';
import type { Locale } from './i18n';

export async function getPublicProjects(locale: Locale = 'zh') {
  const entries = await getCollection('projects', ({ data }) => data.published === true && data.locale === locale);
  return entries.sort((a, b) => a.data.order - b.data.order || b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublicNotes(locale: Locale = 'zh') {
  const entries = await getCollection('notes', ({ data }) => data.published === true && data.locale === locale);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date, locale: Locale = 'zh') {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
}
