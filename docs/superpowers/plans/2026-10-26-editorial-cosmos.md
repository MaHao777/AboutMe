# Editorial COSMOS Implementation Plan

> **For agentic workers:** Execute this plan inline in the existing checkout. The user requested a local visual revision; do not publish this preview.

**Goal:** Turn the welcome screen into a personal story led by real projects, with a consistent editorial visual language across the site.

**Architecture:** Keep Astro content collections, public-content gates, bilingual routes, and existing project details. Add focused components for the event-vision illustration, selected project stories, personal journey, and everyday-life collage. Use the existing published images and text as evidence.

**Tech Stack:** Astro, TypeScript, CSS, native Canvas 2D, Lucide.

---

### Task 1: Shared visual language

- [x] Update `src/layouts/BaseLayout.astro` to default to the cream theme while respecting saved preferences.
- [x] Add `src/styles/editorial.css` with cream `#F5F3EE`, navy `#152638`, orange `#DC774D`, thin rules, responsive spacing, and readable dark mode.
- [x] Update `src/components/Header.astro` with the COSMOS identity and matching theme colors.

### Task 2: Home story and lightweight interactions

- [x] Replace `src/pages/index.astro` with introduction, three selected projects, smaller additional works, milestones, journey, everyday life, and contact. Preserve English through the existing wrapper route.
- [x] Create `src/data/stories.ts` for bilingual question-led project copy with explicit contribution and result scope.
- [x] Create `src/components/EventField.astro` using a static SVG fallback and a bounded Canvas pointer trail. Label this as an interactive illustration; support keyboard mode switching, reduced motion, resize, and router cleanup.
- [x] Create `src/components/SelectedWork.astro` using the actual project screenshots; use the TraceFormer qualitative image without changing the original file.
- [x] Create `src/components/Journey.astro` using native details for the verified internship, research, and current development stages. Allow reading without JavaScript.
- [x] Create `src/components/LifeCollage.astro` using published writing and interests, with a functional random-article link.

### Task 3: Consistent supporting pages

- [x] Replace the work-page planet hero with a question-led editorial heading, preserving all project/background content and disclosure behavior.
- [x] Replace the life-page planet hero with an editorial heading and the everyday-life collage, preserving published writing and background.
- [x] Apply matching project card/detail treatments in `editorial.css`, with visible project summaries and question-led selected stories.
- [x] Update README with the new page structure, interactions, evidence boundaries, and local-preview instructions.

### Task 4: Verification and preview

- [x] Run `npm run check` and `npm run build`; both must pass.
- [x] Start an Astro local preview, verify HTTP success, and open it in Codex.
- [x] Use Playwright to inspect desktop and mobile, light/dark, Chinese/English, selected-project navigation, event-view toggle, journey disclosures, random article, and no-JavaScript/reduced-motion fallbacks.
- [x] Verify no broken local assets/links or horizontal overflow. Save desktop and mobile screenshots in `output/playwright/`.
- [x] Run `git diff --check` and present the working local preview with any verification limits.
