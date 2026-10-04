# Gallery redesign implementation plan

> Execution: implement inline in this session, preserving the existing content collections and publication boundary.

**Goal:** Add the public email and give the entry pages a sparse, animated art direction in blue/white and warm yellow.

**Architecture:** Static Astro pages use a shared SVG art component and CSS tokens. Native details disclose supporting material; an IntersectionObserver progressively enhances scroll animation. Full project and note content stays on its existing routes.

**Tech stack:** Astro, TypeScript, Tailwind CSS, Lucide, native SVG/CSS.

## 1. Public contact and concise labels

- Modify `src/data/profile.ts`: `email: '2030985559@qq.com' as string | null`.
- Add `src/data/presentation.ts` for entry titles, subtitles, and concise outcomes, each explicitly marked public.
- Keep result scope in accessible descriptions and project detail pages.

## 2. Entry pages and art

- Create `src/components/ArtStudy.astro`: decorative inline SVG with blue optical forms or warm sun/branch composition; `aria-hidden="true"`.
- Replace `src/pages/index.astro` with the name, two visual links and three outcomes.
- Replace the heroes in `src/pages/work.astro` and `src/pages/life.astro`; move long biography, experience, tools and timeline into native disclosures.
- Modify `src/components/ProjectCard.astro`: visible title and outcome; move description, role and highlights inside `<details>`.
- Modify `src/components/Footer.astro`: concise mail link and GitHub.

## 3. Shared design and animation

- Replace `src/styles/global.css` with gallery typography, restrained colors, responsive grids, hover treatments and CSS artwork motion. Preserve all detail/note styles.
- Create `src/components/Motion.astro`, included in `src/layouts/BaseLayout.astro`:

```ts
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    element.classList.add('will-reveal');
    observer.observe(element);
  });
}
```

- CSS reduced-motion override disables animation/transitions and always shows revealed content. No added animation dependency.
- Update favicon and Open Graph art to match the gallery identity.

## 4. Verification and handoff

- Run `npm run lint`, `npm run check`, `npm run build`, `git diff --check`: all must exit 0.
- Inspect desktop and 390px mobile entry pages, mail href, native project disclosures, dark mode and reduced motion; check overflow and visible project image loading.
- Audit generated routes and local asset links; confirm raw materials/drafts and unpublished example stay absent.
- Update README animation/editing notes and commit the completed revision.
