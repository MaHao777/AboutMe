# Personal Site Implementation Plan

**Goal:** Build a static bilingual-friendly personal site with separate professional and personal paths and explicit publication controls.

**Architecture:** Astro pages read typed public records from Content Collections and `src/data`. Source materials and editorial drafts stay outside `src` and `public`. A shared layout owns metadata, navigation, theme, and responsive styling.

**Tech Stack:** Astro, TypeScript, Tailwind CSS 4, MDX, Lucide, Git.

## Tasks

- [x] Inspect the directory and background document; keep it as source material, not published copy.
- [x] Configure Astro, MDX, Tailwind, strict TypeScript, lint, and scripts.
- [x] Define `projects` and `notes` schemas with required `published` flags.
- [x] Build shared layout, navigation, theme switcher, footer, and metadata.
- [x] Build home, work, life, project detail, and note detail routes.
- [x] Add reviewed example records and data; keep source materials and drafts separate.
- [x] Document editing and publication workflow, then run lint, type check, and build.

## Verification

Run `npm run lint`, `npm run check`, and `npm run build`. Inspect generated routes and confirm an unpublished sample entry has no generated page or listing. Review the site at desktop and mobile widths.
