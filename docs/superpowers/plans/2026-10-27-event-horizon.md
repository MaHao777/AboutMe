# Event horizon visual redesign

> **For agentic workers:** Implement inline in the existing checkout. Deliver a local preview.

**Goal:** Create a continuous, solemn black-hole-inspired personal site and make public awards immediately visible.

**Architecture:** Use one near-black visual space across the entire site, with an original cinematic black-hole image and restrained pointer/scroll motion. Put the public achievements immediately after a shorter visual opening, add a persistent navigation link, and show awards without disclosures on both home and work pages. Keep project evidence, bilingual routes, published-content gates, and accessible fallbacks.

**Tech Stack:** Astro, TypeScript, CSS, original generated image, native SVG and browser events.

- [x] Generate and save an original black-hole artwork in `public/images/`, plus its prompt/provenance.
- [x] Replace the diagram-like opening with `BlackHoleScene.astro`, using subtle parallax and reduced-motion/router cleanup.
- [x] Add `AchievementsShowcase.astro`; display competition prizes, fund selection, scholarships, and language scores directly.
- [x] Add an awards navigation link and move the work-page awards out of the collapsed background section.
- [x] Rewrite `SelectedWork.astro` and the shared style sheet around continuous dark space, using warm monochrome project art and no panel backgrounds or full-screen project slides.
- [x] Update the shared theme default and chrome, keeping an optional brighter graphite theme.
- [x] Verify the real desktop/mobile render, award visibility, images/evidence, language/theme/navigation, and no-JavaScript/reduced-motion behavior.
- [x] Run lint, type checks, build, link audit, and diff checks. Update README and show the local result.
