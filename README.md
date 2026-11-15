# ClassPulse

A browser-local formative assessment tracker for workshop teachers.

Project setup is complete. Implementation will happen through a feature-branch pull request.

## Planned milestones

1. Working repository setup and static build command (`Setup done`).
2. Project brief and acceptance criteria; open draft PR before app implementation.
3. Responsive three-page shell, navigation, and matching favicon.
4. Validated assessment model and tested summary calculations.
5. Synthetic dataset and resilient browser storage.
6. Assessment entry, validation, and saved-record journey.
7. Searchable records with filtering and confirmed deletion.
8. Dashboard summaries and topic-level learning insights.
9. Safe CSV export, data reset, and print report.
10. Acceptance verification, CI checks, and reviewer documentation.

## Setup

Node.js 22 or newer. No package installation required.

```sh
node scripts/build.mjs
```

The build copies public assets to `dist/`.
