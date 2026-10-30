# COSMOS v1.0.0 Release Plan

> **For agentic workers:** Execute inline in the existing checkout; the user authorized this release and push. Track the steps below without creating another worktree.

**Goal:** Make the accepted COSMOS site the main release and preserve the previous main version as an archive.

**Architecture:** Preserve Git history, fast-forward `main`, and publish annotated archive/release tags. Keep the existing ignored legacy ZIP for earlier uncommitted source. Use Git for local repository and tag transport because the GitHub connector does not provide a local-repository push operation.

**Tech Stack:** Git, npm, Astro, existing Node test suites.

---

- [x] Fetch `origin`, confirm the default branch is `main`, and record the previous main commit `b00b5d4dd36c7f8deabd8e62019fb1d069259417`.
- [x] Set package and lockfile version to `1.0.0`; add `CHANGELOG.md` and update README behavior and archive instructions.
- [x] Run `node --test scripts/cosmos-*.test.mjs`, `npm run lint`, `npm run check`, and `npm run build`; keep local caches/archives/credentials ignored. All 37 tests passed, lint passed, Astro reported zero errors/warnings/hints, and the static build passed. All 125 local page links resolved.
- [x] Prepare the commit, archive, promotion and annotated release-tag procedure below; the previous main is an ancestor of the current branch, so `--ff-only` preserves its history.
- [x] Prepare an atomic push and GitHub Release using the verified tag; final remote verification follows publication. The GitHub CLI login is available and the 11,024,146-byte static ZIP has SHA-256 `1f33e197e833d1d0354588d8a6ff387b42f58ca471376fdf52d68ea5be795ef3`.

Publication commands, executed after this plan is included in the release commit:

```powershell
git add -A
git diff --cached --check
git commit -F tmp/release-commit-v1.0.0.txt
git tag -a archive/pre-cosmos-2026-10-30 b00b5d4dd36c7f8deabd8e62019fb1d069259417 -m "Archive the previous main before COSMOS v1.0.0"
git switch main
git merge --ff-only codex/cosmos-core-demo
git tag -a v1.0.0 -F tmp/release-notes-v1.0.0.md
git push --atomic origin main:main refs/tags/archive/pre-cosmos-2026-10-30:refs/tags/archive/pre-cosmos-2026-10-30 refs/tags/v1.0.0:refs/tags/v1.0.0
gh release create v1.0.0 tmp/cosmos-v1.0.0-dist.zip --repo MaHao777/AboutMe --verify-tag --latest --title "COSMOS v1.0.0" --notes-file tmp/release-notes-v1.0.0.md
git status --short --branch
git ls-remote origin refs/heads/main 'refs/tags/v1.0.0*' 'refs/tags/archive/pre-cosmos-2026-10-30*'
```

This release changes the repository baseline. Hosting configuration and deployment remain a separate operation.
