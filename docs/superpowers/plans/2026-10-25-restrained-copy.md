# Restrained site copy implementation plan

> **For agentic workers:** Implement the checked steps inline in this session.

**Goal:** Reduce decorative and repeated small text across both languages while keeping navigation and useful information clear.

**Architecture:** Edit the shared Astro pages and components so Chinese and English stay consistent. Delete redundant markup and its CSS, retain the existing planetary artwork and interactions, and preserve project facts, image captions, dates, and sources.

**Tech Stack:** Astro, TypeScript, CSS.

---

### Task 1: Simplify the home page and shared chrome

**Files:** `src/pages/index.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ProfileStrip.astro`

- [x] Keep the welcome title and one short subject line: `<p class="masthead-caption hero-arrive">{presentation.home.caption}</p>`.
- [x] Give each planet card its title and arrow; remove orbit labels, English overlines, and slogans.
- [x] Remove the repeated brand subtitle, footer slogans, closing quotation, and generic profile subtitles.

### Task 2: Simplify section headings

**Files:** `src/pages/work.astro`, `src/pages/life.astro`, `src/components/HoverDisclosure.astro`, `src/styles/global.css`, `README.md`

- [x] Remove hero indices, artwork captions, repeated collection labels, and the timeline introduction.
- [x] Use `<summary><span class="index-title">{title}</span><span class="disclosure-plus" aria-hidden="true">＋</span></summary>` for background disclosures, removing their number and hint props.
- [x] Update summary layout to `grid-template-columns: 1fr 40px`, align body content, and remove styles for deleted copy.
- [x] Document the simpler entry-page hierarchy.

### Task 3: Verify

- [x] Run `npm run lint`, `npm run check`, `npm run build`, and `git diff --check`.
- [x] Inspect Chinese and English home, work, and life pages; verify links, themes, and disclosures still work.
- [x] Inspect a narrow layout and return the preview to the Chinese home page.
