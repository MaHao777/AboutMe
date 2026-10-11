# Home introduction update implementation plan

> **For agentic workers:** Implement the checked steps inline in this session.

**Goal:** Center the new home title, show basic personal information beneath the gallery, and move email contact beside GitHub.

**Architecture:** Keep the shared results strip on the work page. Add a home-only profile strip, reuse published profile data, and update shared header/footer styles for both locales.

**Tech Stack:** Astro, TypeScript, CSS.

---

### Task 1: Home title and profile information

**Files:** `src/pages/index.astro`, `src/components/ProfileStrip.astro`, `src/styles/global.css`

- [x] Replace the home heading with the exact text `Welcome To My COSMOS` and center the heading and caption.
- [x] Render three basic information cells using the public profile fields, with matching English copy.
- [x] Adjust desktop and mobile typography so the title and cells remain readable.

### Task 2: Contact placement

**Files:** `src/components/Header.astro`, `src/components/Footer.astro`, `src/styles/global.css`

- [x] Add a mailto contact link beside GitHub in the shared header.
- [x] Remove the large footer contact section and its unused styles.
- [x] Keep GitHub and contact available at mobile widths.

### Task 3: Verify

- [x] Run `npm run lint`, `npm run check`, `npm run build`, and `git diff --check`.
- [x] Inspect the Chinese and English home pages at desktop and mobile widths.
