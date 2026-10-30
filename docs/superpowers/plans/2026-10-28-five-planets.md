# Five Planets Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the retired portfolio with the existing COSMOS experience, organized into five planets and seventeen satellites with overview and detailed evidence.

**Architecture:** Keep the Three.js flight, orbit, camera and detail reader. Store overview copy and evidence metadata in `src/data/portfolio.ts`, spatial configuration in `src/cosmos/universeData.ts`, and rich detail templates in `UniverseContent.astro`. Serve the experience at `/`, preserve `/cosmos/`, and offer a static `/about/` view for touch devices and visitors without WebGL.

**Tech Stack:** Astro, TypeScript, Three.js, Markdown, native Node tests; Python reportlab/pypdf/pypdfium2 for certificate redaction.

---

### Task 1: Preserve and retire the old project
- [x] Archive the current source, assets, scripts, documentation and package files under ignored `output/archives/` before removal, including uncommitted changes.
- [x] Remove old layouts, components, bilingual routes, unused content and imagery after the new entry point works. Retain the three research articles and their evidence, plus three public WeChat article links.

### Task 2: Implement the content contract
- [x] Add 4 / 3 / 3 / 3 / 4 satellites: education, awards, languages, skills; wavefront, fringe, weak-target detection; auto-configuration, testing software, ROS 2; piano, basketball, writing; QQ, WeChat, GitHub, Gmail.
- [x] Use problem / method / outcome summaries for research and internships. Preserve verification scope for research results and avoid claiming an undocumented automatic-configuration implementation.
- [x] Render certificate images from redacted document copies. Link source material for the official college and experimental-class explanations.
- [x] Keep missing personal photos absent and explicitly record the missing assets in maintainer documentation. Link the supplied piano repertoire to its authentic album cover.

### Task 3: Promote COSMOS
- [x] Use shared `CosmosPage.astro` at `/` and `/cosmos/`, replacing Demo and old-site links.
- [x] Add a readable `/about/` page using exactly the same content and detail templates, with section links from each planet.
- [x] Add working contact actions and WeChat copy, preserving detail scroll isolation and focus recovery. Support narrow screens and touch scrolling without breaking the orbit controller.

### Task 4: Validate and document
- [x] Run `node --test scripts/cosmos-*.test.mjs` for physics/orbit/content contracts, `npm run check`, and `npm run build`.
- [x] Exercise all 17 satellite details, freeze while reading, Esc level navigation, contacts, static view, mobile layout and no-WebGL fallback in a local browser.
- [x] Inspect actual screenshots, verify that private raw certificates and retired routes are absent from `dist/`, and update `README.md` and `docs/COSMOS.md`.

Execution proceeds in this session under the user's request; no deployment was requested for this local project.
