# 马浩 · 个人网站

一个以 Astro 构建的静态个人主页，分为 [Professional](/src/pages/work.astro) 和 [Personal](/src/pages/life.astro) 两个方向。项目与文章通过 Astro Content Collections 管理，资料默认不发布。

## 本地运行

需要 Node.js 22 或更新版本。项目首次开发使用 Node.js 24。

```bash
npm install
npm run dev
```

提交或部署前运行：

```bash
npm run lint
npm run check
npm run build
```

构建结果位于 `dist/`。部署时设置 `SITE_URL` 为实际站点域名，例如 `SITE_URL=https://your-domain.example npm run build`。Windows PowerShell 可使用 `$env:SITE_URL='https://your-domain.example'; npm run build`。它用于生成 canonical 与 Open Graph 绝对地址。默认的 `https://example.com` 只供本地占位，正式发布前必须替换。

## 目录

```text
src/
  components/          公共导航、卡片、标题与页脚
  content/projects/     项目 Markdown / MDX
  content/notes/        文章 Markdown / MDX
  content.config.ts     两个集合的 schema
  data/                个人介绍、技能、奖项、链接
  layouts/             公共 HTML、SEO、主题
  pages/               路由页面
  styles/              全局样式与响应式规则
materials/             原始资料，不参与构建
drafts/                等待检查的稿件，不参与构建
public/                确认可公开的静态图片、favicon、OG 图
```

## 新增项目

1. 在 `drafts/` 写草稿，核对项目名称、个人贡献、链接和公开权限。
2. 在 `src/content/projects/` 建立 `.md` 或 `.mdx` 文件。文件名就是详情页 slug，例如 `my-project.mdx` 对应 `/projects/my-project/`。
3. 填写 frontmatter，并保持 `published: false` 直到人工确认。示例：

```yaml
---
title: My Project
description: 一句话介绍
date: 2026-10-04
role: 我的具体职责
category: 研究与工程
outcome: 最重要的一项已验证成果或交付
order: 10
highlights:
  - title: 我的工作
    description: 可展开查看的具体贡献
technologies: [TypeScript, Astro]
cover: /images/my-project.svg
coverAlt: 说明图片的内容
coverCaption: 标明这是实测图、软件截图还是流程示意
github: https://github.com/your-name/my-project
paper: https://example.com/paper
demo: https://example.com/demo
featured: false
status: ongoing # ongoing / completed / archived
published: false
---
```

`outcome` 必填，用于第一眼呈现项目结果；`order` 控制排序，数字小的靠前。`highlights` 用于卡片的原生展开区域。`cover`、`github`、`paper`、`demo` 可省略。正文建议包含问题、我的工作、解决方法、技术细节、成果与交付、学到的事。确认公开后改为 `published: true`；首页显示排序靠前的三个公开精选项目。

需要放实际结果图时，可以增加 `gallery`，每项包含 `src`、`alt`、`caption`。每张图必须说明实验范围，概念图不要写成实测曲线。

## 信息层次与视觉

首页使用双入口画廊构图，Professional 使用蓝白的雕塑与作品选集，Personal 使用暖黄艺术构图。两者共用导航、字体、组件与深浅主题，通过 `BaseLayout` 的 `section` 设置不同颜色。入口页短文案集中在 `src/data/presentation.ts`。

内容按三层呈现：第一层只显示标题与成果；第二层在项目卡片内展开摘要、个人工作，背景、奖项和技能也默认折叠；第三层跳转详情，解释问题、方法、限制和图片。展开使用 HTML `details`，不需要客户端脚本。代表成果摘要在 `src/data/profile.ts` 的 `featuredResults` 中管理。

TraceFormer 的 `0.954117` 是冻结完整系统在 24 序列验证集上的独立复评结果，不能改写成官方测试成绩。其实际图保存在 `public/images/traceformer-*.png`。其余项目封面是流程或功能示意，并非软件截图或实测数据。原始证书未复制进发布目录。

## 新增文章

在 `src/content/notes/` 建立 `.md` 或 `.mdx` 文件，填写：

```yaml
---
title: 文章标题
description: 简短摘要
date: 2026-10-04
category: 思考 # 思考 / 生活 / 技术 / 随笔
readingMinutes: 3
published: false
---
```

`readingMinutes` 可省略。请先从原始记录整理成独立文章，删去不适合公开的人名、位置、联系方式等信息，再显式改为 `published: true`。`example-unpublished.md` 和 `why-i-keep-notes.mdx` 是未发布示例，构建中不会出现。

公众号等外部文章仍放在 `src/content/notes/`，另填写 `source: 微信公众号` 和 `externalUrl: https://...`。Personal 只展示标题与日期并直接打开原文，不生成空的本站详情页，也不复制公众号全文。当前三篇公众号文章已经按页面元数据核对标题和发表日期。

## 修改个人资料

- `src/data/profile.ts`：姓名、简介、经历、兴趣与时间轴。邮箱通过 `email` 设置，当前公开邮箱为 `2030985559@qq.com`。PDF 简历地址通过 `resumeUrl` 设置，未填写时不显示下载按钮。
- `src/data/presentation.ts`：首页及两个入口页的短标题、标签。
- `src/data/skills.ts`：按场景分组的技术能力。
- `src/data/achievements.ts`：已确认可公开的成果。
- 莙政基金记录已核对 2026 年入选名单中马浩的条目，正式课题名为「基于神经形态视觉的超高速波前感知技术」。成果栏、研究经历与波前项目详情同步展示，状态表述为项目入选。
- `src/data/resume.ts`：展示于 Professional「奖项与成果」的奖学金与四六级成绩。大学奖学金按笔记保留“大一”阶段；两次集萃实习一等奖学金按本人确认合并展示，未补写未经确认的获奖日期。考试成绩与月份以成绩单为准，证明原图不放进 `public/`。
- `src/data/links.ts`：GitHub 链接。

这些结构化记录同样有 `published` 字段，页面只渲染标记为 `true` 的列表项。单例 `profile` 和 `links` 如果未标记公开，会直接中止构建，防止误发布。修改后建议检查实际构建输出。

## 隐私与发布边界

- `materials/` 和 `drafts/` 不在 Astro 的内容源或 `public/` 下，不会被静态构建复制。
- `materials/diaries/` 被 `.gitignore` 整目录忽略；原始项目、奖项材料和草稿内容也默认忽略，避免误提交。
- 现有 `个人介绍背景资料.md` 是事实底稿，已被 Git 忽略；它不是网站正文。
- Content Collections 的 `published` 默认值是 `false`。列表与动态详情页都只读取 `published: true` 的条目。
- 不要把私人文件放进 `public/`。`public/` 下的文件会原样进入最终站点。

## 设计与实现

使用 Astro 静态输出、TypeScript、Tailwind CSS 4、MDX 与 Lucide 图标。主题切换记住选择，`Motion.astro` 使用原生 IntersectionObserver 实现一次性滚动入场；悬停、雕塑浮动和植物轻摆由 CSS 实现，不使用动画库。`prefers-reduced-motion` 会关闭动态效果，JavaScript 未启用时内容仍可阅读。`ArtStudy.astro` 是可编辑的原生 SVG 装饰，不是项目实测图。深浅主题与移动端布局均由同一套样式支持。

`HoverDisclosure.astro` 统一管理两个入口页下方的补充栏目：桌面鼠标移入展开、离开收回，使用原生 Web Animations API 平滑改变高度，并配合内容淡入、淡出与加号旋转。快速移入移出会从当前高度继续动画。触屏通过点击切换，键盘聚焦可展开并保持内部链接可用；系统开启减少动态效果时直接切换。未启用 JavaScript 时仍可使用原生 `details` 点击展开。
