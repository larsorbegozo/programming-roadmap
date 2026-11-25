# Lyra Roadmap

A personal learning dashboard for going from zero programming knowledge to building **Lyra**, a vocabulary-learning mobile app, with Claude Code.

Built with React, TypeScript, Vite, Tailwind CSS and Lucide icons. There is no backend: all progress is stored in your browser's localStorage.

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
  lib/               Pure logic: progress math, dates, storage, import validation
  types/             TypeScript types for curriculum and saved state
```

To change the curriculum, edit `src/data/curriculum.ts`. Lesson ids are generated from their position (`p1-l3` = phase 1, lesson 3), so reordering lessons changes which lessons your saved progress points to.
