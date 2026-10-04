// Public entry-page copy. Detailed biographical and project text lives in data/content.
export const presentation = {
  published: true,
  home: { caption: '光电 · 软件 · 生活', work: '研究与作品', life: '生活与文字' },
  work: { heading: ['研究，', '然后创造。'], caption: '光电 × 软件', projects: '作品选集' },
  life: { heading: '日常拾页。', caption: '音乐 · 运动 · 影像', notes: '一些文字' },
} as const;

if (!presentation.published) throw new Error('Entry-page copy must be marked public.');
