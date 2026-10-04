# Bilingual Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide Chinese and English views with Chinese project section headings with a top-right language switch and concise, emphasized results.

**Architecture:** Keep current Chinese routes and add matching `/en/` routes. Shared components select localized UI and public profile data from the URL. Pair published project Markdown translations by locale and slug; preserve publication flags and evidence boundaries.

**Tech Stack:** Astro, TypeScript, Markdown/MDX, CSS.

---

- [x] Add locale helpers, translated public data, and locale-aware content filtering and dates.
- [x] Update layout, header, footer, cards, and pages; keep navigation and anchors within the selected language.
- [x] Condense six project articles, translate published content and SVG labels, and emphasize outcomes and contributions with semantic `strong` elements.
- [x] Run `npm run lint`, `npm run check`, and `npm run build`; audit generated routes and text, then check language switching and mobile layout in a browser.

No deployment or publication-state changes are needed. Implement inline as authorized by the user's request.

User clarification: Chinese may retain English proper names and technical terms; project section headings must be Chinese. English pages remain fully English.

Validation: ESLint passed; Astro check reported zero errors, warnings, and hints; static build generated 18 pages. Audited English text, localized navigation, assets, Chinese section headings, emphasis, and unpublished routes. Browser checks verified language and anchor switching, theme persistence, and all 24 entry-page/viewport combinations at 320, 390, 768, and 1440 pixels with no horizontal overflow. Fixed English life heading overflow by allowing natural wrapping and constrained the home illustration offset at tablet widths. Build retains the existing MDX head-inject bundler warnings. Browser artifacts are under ignored `output/playwright/bilingual-check/`.
