# ClassPulse project brief

## Problem and intended user

Workshop teachers need a quick way to record formative assessment scores, find learners who may benefit from support, and decide which topics to revisit. ClassPulse supports that small, single-device workflow without a backend or account.

## Scope and stack

Three linked pages: overview, assessment entry/records, and insights/report. Plain HTML, CSS, browser JavaScript modules, localStorage, Node's built-in test runner, and a static build. No AI, third-party services, paid APIs, authentication, or real student dataset. Synthetic learners use aliases. Scores are signals for teacher review, not automated decisions about learners.

## Skills demonstrated

Accessible frontend forms, responsive layouts, data validation, aggregation with explicit denominators, browser persistence and error recovery, CSV export, testing, and education-focused product design.

## Acceptance criteria

- [x] Navigate all three pages using keyboard and at narrow mobile widths.
- [x] Add an assessment with alias, topic, date, score and maximum; persist after reload.
- [x] Reject invalid scores, blank fields, and invalid/future dates with actionable feedback.
- [x] Search/filter records and remove a selected record after confirmation.
- [x] Show assessment count, mean assessment percentage and distinct learner count.
- [x] Group percentages by topic and explain the below-60% review threshold.
- [x] Load synthetic demo data explicitly; show useful empty and storage-error states.
- [x] Export filtered records as safe CSV; print insights; reset only after confirmation.
- [x] Pass domain tests, static lint, production build, and browser journey checks.
- [x] Document setup, calculations, limitations, data privacy, and verification results.

## Design decisions

Light cream surfaces, ink text, teal actions, labeled compact progress bars. Semantic HTML and native controls. All assessments have equal weight in the mean, regardless of maximum score. Browser storage stays on the current origin/device; it is not secure storage or a backup. Prefer aliases and synthetic data. Export for backup; importing CSV is outside this version's scope.

## Delivery

Follow the ten milestones in README.md. Default branch contains setup only. All implementation stays on `feat/classpulse` and the same draft PR until acceptance checks pass. Portfolio integration follows only after Gillian merges the project PR.

