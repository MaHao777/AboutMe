# Visual composition implementation plan

> **For agentic workers:** Execute this local revision inline in the current checkout.

**Goal:** Establish a clear visual peak around the flagship optical project and remove repeated resume-like presentation.

**Architecture:** Keep public content collections and detail-page evidence intact. Use deterministic SVG artwork for three distinct project covers, a full-width flagship and asymmetric supporting projects, a compact secondary-work list, a narrative journey, and an open writing/music composition. Retain the existing light-field interaction and adapt its palette to the paper background.

**Tech Stack:** Astro, TypeScript, SVG, Canvas 2D, CSS.

### Task 1: Project art and composition

- [x] Create `scripts/generate-project-art.mjs` and three original SVG concept covers under `public/images/` using analytic phase contours, event trajectories, and communication geometry. Label them as concept artwork rather than experimental results.
- [x] Replace poetic project-title templates in `src/data/stories.ts` with actual names and direct summaries.
- [x] Rewrite `src/components/SelectedWork.astro`: one immersive optical flagship, a wide TraceFormer study, and a narrower engineering composition, each with a native evidence disclosure.
- [x] Update `src/components/ProjectCard.astro` and `src/pages/work.astro` to use the same covers and remove the repeated results strip.

### Task 2: Home and everyday content

- [x] Integrate the hero field with its surrounding paper background; preserve pointer, keyboard, touch, and event-view behavior in both themes.
- [x] Remove the standalone home milestone section and show the relevant honors with the optical project.
- [x] Make additional projects a short horizontal list.
- [x] Rewrite `src/components/Journey.astro` around coursework, industry practice, and current research without repeating technical deliverables or inventing personal decisions.
- [x] Rewrite `src/components/LifeCollage.astro` around published writing and real interests; remove faux-paper cards and retain the random-article interaction.
- [x] Replace composition-specific CSS in `src/styles/editorial.css`, with responsive and reduced-motion variants.

### Task 3: Verification and handoff

- [x] Inspect actual desktop and mobile renders, Chinese/English, and both themes.
- [x] Verify native evidence disclosures, public links, field palette/interaction, client navigation, and reduced-motion/no-JavaScript fallbacks.
- [x] Run lint, Astro checks, build, link audit, and diff checks. Save final screenshots in `output/playwright/`.
- [x] Update README and return the local preview for review.
