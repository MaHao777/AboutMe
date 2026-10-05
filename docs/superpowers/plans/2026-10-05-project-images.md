# Project Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three project illustrations with suitable reference images and add the historical competition screenshot to the detection project.

**Architecture:** Keep the existing Astro content collections and shared bilingual detail page. Copy four selected original images into `public/images`, add translated descriptions, and make detail covers open their full-resolution originals. Keep existing validation figures and their scope unchanged.

**Tech Stack:** Astro, Markdown frontmatter, TypeScript, CSS, Playwright CLI.

---

### Task 1: Select and copy images

**Files:** Create `public/images/event-optics-interface.png`, `public/images/fringe-lock-experiment.jpg`, `public/images/traceformer-architecture.png`, and `public/images/traceformer-competition.png`.

- [x] Inspect all six standalone images. Select the wavefront interface, second fringe photo, complete HUAV architecture, and competition screenshot. Exclude the incomplete architecture and heavily blurred lab photo.
- [x] Copy the selected originals without altering their content. Do not copy patent documents or application forms. Source and published-file SHA-256 hashes match for all four images.

### Task 2: Integrate bilingual content and full-image links

**Files:** Modify the Chinese and English versions of `src/content/projects/event-optics.md`, `fringe-lock.md`, and `traceformer.md`; `src/content.config.ts`; `src/components/ProjectCard.astro`; `src/pages/projects/[slug].astro`; `src/styles/global.css`; and `README.md`.

- [x] Use the interface, fringe experimental photo, and architecture as covers, with accurate dimensions, translated alternative text, and captions grounded in visible content.
- [x] Append the historical competition screenshot to both TraceFormer galleries. Describe the highlighted submission dated August 31, 2026 and its 0.9338 score without inferring a final rank or equating it to local validation.
- [x] Add optional cover dimensions for intrinsic sizing. Wrap detail covers in the same full-image link used by gallery images, and give image documents a white background for legibility in both themes. Rename the gallery heading to Project gallery / 项目图集.
- [x] Update README image provenance and bilingual image guidance.

### Task 3: Verify the result

- [x] Run `npm run lint`, `npm run check`, `npm run build`, and `git diff --check`. Astro check reports zero errors, warnings, or hints. Build completes with the existing MDX directive warnings.
- [x] Verify all four new image URLs on the built site and review eight Chinese/English routes at 1440 and 390 px widths. Images decode successfully, covers preserve their aspect ratios, and there is no horizontal overflow. Clicking the architecture and competition links opens their originals in new tabs.
- [x] Check dark-theme diagram contrast and the narrow leaderboard screenshot as two additional scenarios. Capture screenshots into ignored `output/playwright/`.

**QA repair:** The initial browser pass found two pre-existing invalid English SVGs, `public/images/project-vehicle-en.svg` and `public/images/project-luminamind-en.svg`. XML parsing confirmed unescaped ampersands in text nodes. Escape them as `&amp;`; all 16 SVG assets now parse, and the repeated browser pass succeeds.
