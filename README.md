# BodyTrack ⚖️

A private, offline-first app to track your **weight** and **body measurements**, built with React Native and Expo.
Runs on **iOS, Android and the web**. Your data never leaves your device: no account, no server.

[![CI](https://github.com/Vincicent/BodyTrack/actions/workflows/ci.yml/badge.svg)](https://github.com/Vincicent/BodyTrack/actions/workflows/ci.yml)

> 🚧 Work in progress: I'm building this app step by step to learn modern React Native.
> Current stage: navigation, design system, translations (EN/FR), tests and CI are in place.
> Next: the domain layer, then a local SQLite database.

## Features

**Available now**

- 4-tab navigation (Dashboard, History, Measurements, Settings), add/edit screens and deep links
- Light & dark mode with accessible colours (WCAG AA contrast)
- English 🇬🇧 and French 🇫🇷, following the phone's language

**Planned**

- Log weight (kg/lb) and body measurements (cm/in)
- History grouped by month, with swipe to delete
- Trend chart with a 7-day moving average, goal tracking and BMI
- Daily reminders, progress photos, CSV export/import

## Tech stack

| Area         | Choice                                      | Why                                                   |
| ------------ | ------------------------------------------- | ----------------------------------------------------- |
| Framework    | Expo SDK 57 (React Native 0.86, React 19.2) | Officially recommended way to build React Native apps |
| Language     | TypeScript 6 (strict)                       | Catch errors before runtime                           |
| Navigation   | Expo Router                                 | File-based routes, deep links and web URLs for free   |
| Translations | i18next + react-i18next + expo-localization | Industry standard, detects the device language        |
| Tests        | Jest + React Native Testing Library         | Test components the way users use them                |
| Quality      | ESLint + Prettier, GitHub Actions CI        | Consistent code, every push checked automatically     |

## Getting started

```bash
npm install
npx expo start      # then press i (iOS), a (Android) or w (web)
```

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm test`          | Run the tests                              |
| `npm run typecheck` | Check TypeScript types                     |
| `npm run lint`      | Lint the code                              |
| `npm run format`    | Format the code with Prettier              |
| `npm run check`     | All of the above (run before every commit) |

## Architecture

Code is organised **by feature**, not by file type:

```
src/
  app/          routes only (Expo Router): thin screens
  features/     one folder per feature (weight, measurements…)
                  domain/      pure business logic, no React, no database
                  data/        database access
                  hooks/       React glue
                  components/  feature UI
  shared/       reusable code: ui/ (design system), theme/, lib/ (i18n…)
  test/         shared test helpers
```

**Dependency rule:** `app → features → shared`. The `domain` layer imports nothing, and `shared` never imports a feature.
This keeps business rules easy to test and the codebase easy to change.

## Testing strategy

| Layer               | Test type                                               | Tool                         |
| ------------------- | ------------------------------------------------------- | ---------------------------- |
| Domain, utilities   | Unit tests (written first)                              | Jest                         |
| Database access     | Integration tests on a real in-memory SQLite            | Jest + better-sqlite3        |
| Components, screens | Component tests, querying by role and label like a user | React Native Testing Library |
| Navigation          | Router tests                                            | expo-router/testing-library  |
| Whole app           | A few end-to-end tests on critical journeys             | Maestro                      |

Rules: test behaviour, not implementation; no screen snapshots; mock only at the boundaries; `npm run check` must
pass before every commit.

## Author

Built by [**Vincicent**](https://github.com/Vincicent) as a learning and portfolio project.
