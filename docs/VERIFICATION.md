# Verification — 2026-11-15

## Automated checks

- `node --test`: 11 passed, 0 failed. Validation, date boundaries, percentage calculations, case-insensitive grouping/filtering, empty/corrupt/blocked storage, CSV escaping, and formula neutralization.
- `node scripts/lint.mjs`: passed. This dependency-free static check covers JavaScript syntax, HTML language/viewport/favicon, and referenced local assets. It is not a full style or accessibility linter.
- `node scripts/build.mjs`: passed. Static production assets generated in `dist/`.
- Local runtime: Node 24.22.1. GitHub workflow runs the same checks on Node 22.

## Browser acceptance

Tested the production `dist/` using Microsoft Edge and a loopback HTTP server. Only synthetic records were used.

- Empty overview and assessment workspace display actionable starting states.
- Blank submission and score 11 out of 10 show actionable errors.
- Saved QA Learner / Decimals / 7.5 out of 10; displayed 75%; survived reload.
- Search miss shows no-results state; matching alias and topic filtering work.
- Delete cancel preserves the checkpoint; confirmation removes it.
- Explicit demo load creates 12 assessments; Loops filter shows 4 of 12.
- CSV export control reports four filtered assessments; escaping/formula safety is covered by unit tests. Browser download retention depends on browser settings.
- Overview shows 12 assessments, four learners, mean 70%.
- Insights shows Fractions 60%, Loops 70%, Data literacy 80%, and three below-60% checkpoints.
- Reset cancel preserves all 12 records; confirm clears them; demo can be loaded again.
- Navigation works across all three pages, including Enter activation. Form fields have explicit labels; dialog defaults to Cancel.
- Screens inspected at desktop and 390px mobile. At 320px, discovered and fixed navigation overflow; all three pages then had document scrollWidth equal to clientWidth (305px after scrollbar). Tables scroll within their containers.
- Print control opens native Edge print preview containing metrics, topic means, context, and the check-in queue. Corrected stylesheet order after inspecting the preview. Physical printing was not attempted.
- No captured browser console errors on final inspection.

## Evidence

- `overview-desktop.jpg`: full overview with synthetic records.
- `insights-mobile.jpg`: full insights page at a 390px viewport.

## Limits

Storage failure/recovery is unit-tested; it was not simulated by changing browser security settings. No automated browser regression suite, screen-reader audit, cross-browser certification, or hosted deployment is claimed. This is a single-user, single-tab prototype with a 10,000-record storage limit; large-dataset rendering is not benchmarked. Use learner aliases; localStorage is neither encrypted nor a durable backup.
