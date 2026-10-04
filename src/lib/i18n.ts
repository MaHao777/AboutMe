export type Locale = 'zh' | 'en';

export function getLocale(path: string): Locale {
  return /^\/en(?:\/|$)/.test(path) ? 'en' : 'zh';
}

export function localePath(path: string, locale: Locale) {
  const bare = path.replace(/^\/en(?=\/|$)/, '') || '/';
  return locale === 'en' ? `/en${bare}` : bare;
}

export function translator(locale: Locale) {
  return (zh: string, en: string) => locale === 'zh' ? zh : en;
}

export function contentSlug(id: string) {
  return id.replace(/^en\//, '');
}
