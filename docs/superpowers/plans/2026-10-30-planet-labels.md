# Planet Hover Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide satellite labels during flight, reveal smooth frosted planet introductions on hover, animate label visibility, and simplify the brand to a black-hole icon plus COSMOS.

**Architecture:** Keep the current local checkout and existing orbit/content behavior. In UniverseScene, separate label visibility from DOM removal, keep raycast/label hover continuity with a brief cancellable exit grace, and reveal the current planet description/body in a collapsible label section. In cosmos.css, animate an inner glass surface independently of the outer 3D position. Use an inline SVG black-hole mark in the shared CosmosPage header.

**Tech Stack:** Astro, TypeScript, existing Three.js picking/projection, CSS grid/opacity/visibility transitions and backdrop-filter.

---

- [x] Replace the star mark with a small original black-hole SVG and remove the Chinese brand suffix/divider.
- [x] Build compact planet labels with a collapsible description, concise content summary and entry hint; support keyboard focus and pointer movement between planet and card.
- [x] Restrict satellite labels to the active exploration system and animate visibility without setting `hidden`/`display:none` during fade-out; remove invisible labels from interaction and keyboard focus immediately.
- [x] Add restrained frosted glass, a faint border, reversible expansion/fade animation, narrow-screen layout and reduced-motion behavior.
- [x] Verify flight, planet hover/leave/reentry, label click, satellite exploration and return in the browser; run type/build and existing controller tests, then save a representative screenshot.

Execution remains inline and local. Existing model, black-hole and portfolio content are retained.

Validation: Astro check reports zero errors/warnings/hints; static build succeeds; all 37 existing tests pass. Browser inspection confirms zero visible satellite labels during initial and forward flight, continuous hover when moving from sphere to card, collapsed content after leaving, keyboard focus expansion and blur collapse, selected satellite labels during exploration, and non-interactive invisible labels. At 390 × 844 the expanded card remains between x=12 and x=292 and the document width remains 390; viewport override was reset. Reduced-motion behavior uses the existing universal transition override. Screenshot and browser audit: task visualization folder `horizon-refinement/planet-labels-final.jpg` and `planet-labels-audit.json`.
