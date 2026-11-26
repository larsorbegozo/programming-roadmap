# Lyra Roadmap

A personal learning dashboard for going from zero programming knowledge to building **Lyra**, a vocabulary-learning mobile app, with Claude Code.

Built with React, TypeScript, Vite, Tailwind CSS and Lucide icons. There is no backend: all progress is stored in your browser's localStorage.

## Phase checkpoints

Every phase ends with a checkpoint. A phase only counts as completed when all its lessons are marked done **and** its checkpoint is passed:

- **Questions** (multiple choice, select-all, typed answers): auto-graded, 80% needed. Options are reshuffled on each attempt, and wrong answers are not revealed until you pass.
- **Coding problems**: your code runs in the browser against real tests.
  - JavaScript runs in a Web Worker with a time limit, so infinite loops cannot freeze the page.
  - TypeScript is type-checked in strict mode by the real TypeScript compiler (lazy-loaded), including tests that assert wrong code is *rejected*.
  - React and React Native components are rendered with `react-test-renderer` and the tests press their buttons. React Native components (`View`, `Text`, `Pressable`, `FlatList`…) are lightweight stand-ins.
  - SQL runs on a real SQLite database (`sql.js`) and results are compared with a reference solution.

## Final exams

Each phase also has a timed final exam with a deadline, university style (`#/exams`):

- You set a start date, weekly hours and an optional break; the app computes a deadline per phase from its estimated length (phases interrupted by the break start after it).
- To sit a final you must be *regular* (all lessons done + checkpoint passed) and have passed the previous phase's final.
- One attempt per sitting, timed (30–60 min), new questions and problems. "Run examples" runs only visible tests; grading adds hidden tests. A problem earns partial credit only if the starter was changed and an example test passes.
- Grade 1–10, pass with 4 (60%). Fail or miss → retake one week later. Fail the retake → the phase is *libre*: a new sitting every week, and every later deadline moves back a week.
- A phase is completed only when lessons, checkpoint and final are all done.

Final exam content lives in `src/data/finals/`.

Content lives in `src/data/checkpoints/p0.ts` … `p11.ts`. In development, run `window.__lyraValidate()` in the browser console: it checks that every reference solution passes all its tests and every starter fails at least one.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run typecheck  # TypeScript checks
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Deploying (GitHub Pages)

`.github/workflows/deploy.yml` builds the app and publishes it to GitHub Pages on every push to `main`.
One-time setup in the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Progress is saved per browser and per site address. Use **Settings → Export JSON** to back up, or to move progress between your local copy and the hosted site.

## Project structure

```
src/
  components/        Shared UI (layout, buttons, progress bars, dialogs…)
  data/              Curriculum, resources and milestones (edit these to change content)
  features/          One folder per screen: dashboard, roadmap, lessons, resources, planner, progress, settings
  hooks/             App state store (React context + reducer) and hash-based routing
  lib/               Pure logic: progress math, dates, storage, import validation, quiz grading
  lib/runner/        Code runner: Web Worker, in-browser TypeScript compiler, content validator
  types/             TypeScript types for curriculum and saved state
```

To change the curriculum, edit `src/data/curriculum.ts`. Lesson ids are generated from their position (`p1-l3` = phase 1, lesson 3), so reordering lessons changes which lessons your saved progress points to.
