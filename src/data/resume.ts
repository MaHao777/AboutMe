// Public résumé facts only; original records and score reports stay outside the site.
// Scholarship notes identify the academic stage, not a confirmed award date.
export const scholarships = [
  { published: true, period: '大一', title: '学习优秀特等奖学金' },
  { published: true, period: '大一', title: '综合奖学金' },
  { published: true, period: '大一', title: '精神文明专项奖学金' },
] as const;

// Totals and examination months verified against the original score report images.
export const languageScores = [
  { published: true, title: '大学英语四级', code: 'CET-4', score: 623, date: '2024-12', dateLabel: '2024 年 12 月' },
  { published: true, title: '大学英语六级', code: 'CET-6', score: 606, date: '2025-06', dateLabel: '2025 年 6 月' },
] as const;
