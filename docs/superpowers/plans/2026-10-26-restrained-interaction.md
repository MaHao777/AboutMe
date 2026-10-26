# Restrained layout and interactive light field implementation plan

> **For agentic workers:** Implement the steps inline in the current checkout.

**Goal:** Remove decorative microcopy and make the optical illustration respond meaningfully to visitors.

**Architecture:** Remove redundant markup from shared bilingual pages and components, preserving facts and detailed project evidence. Replace the old pointer overlay with a focused Canvas 2D renderer in `src/lib/eventField.ts`; the Astro component owns the static fallback and accessible controls.

**Tech Stack:** Astro, TypeScript, Canvas 2D, CSS.

### Task 1: Remove extra copy

- [x] Remove home edition labels, repeated subtitles, diagram annotations, section overlines, project-image numbers, secondary contribution paragraphs, milestone numbering, and collage slogans.
- [x] Simplify headings and retain actual project names, readable summaries, local-validation scope, public article sources, and detailed image captions in project pages.
- [x] Update `src/styles/editorial.css` to remove obsolete rules and resize the remaining text for reading.

### Task 2: Rebuild the interaction

- [x] Implement an elastic point surface: the pointer bends it, clicks launch expanding waves, and inertia carries the motion after input.
- [x] Provide two views of the same changing surface: light field and red/blue event traces.
- [x] Add touch and keyboard input, static SVG fallback, reduced-motion behavior, bounds on particles/frame rate, offscreen/hidden pausing, and client-router cleanup.

### Task 3: Verify and preview

- [x] Run lint, Astro checks, build, and local-link audit.
- [x] Inspect desktop/mobile and Chinese/English routes; exercise pointer deformation, click waves, view switching, keyboard, reduced motion, no-JavaScript fallback, and return navigation.
- [x] Update README, verify the existing local preview, and return it to the Chinese home page.
