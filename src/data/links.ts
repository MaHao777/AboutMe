export const links = {
  published: true,
  github: 'https://github.com/MaHao777',
  githubLabel: 'MaHao777',
} as const;

if (!links.published) {
  throw new Error('Links are not marked public. Refusing to build the site.');
}
