# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vue 3 + TypeScript + Vite frontend with Capacitor Android support.
- `src/main.ts`: app bootstrap (Vue, Pinia, router, Capacitor setup).
- `src/pages/`: route-level screens grouped by feature (`auth/`, `booking/`, `driver/`, `driver-apply/`, etc.).
- `src/components/`: reusable UI parts (e.g., `NativeMap.vue`, `AppHeader.vue`).
- `src/store/`: Pinia stores (`auth.ts`, `booking.ts`, `driver.ts`).
- `src/services/`: API, HTTP, socket clients and shared service types.
- `src/styles/`: global tokens and base/component CSS.
- `android/`: native Android project synced by Capacitor.

## Build, Test, and Development Commands
Run commands from repo root:
- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server on `http://localhost:5173`.
- `npm run build`: create production web build.
- `npm run preview`: serve the production build locally.
- `npm run android:sync`: sync web/native changes to Android project.
- `npm run android:apk:debug`: build web assets, sync, then assemble debug APK.
- `npm run android:apk:release`: build and assemble release APK.

## Coding Style & Naming Conventions
- Use TypeScript with `strict` mode; keep types explicit for public props, store state, and service payloads.
- Follow existing style: 2-space indentation, single quotes, semicolon-free TS.
- Vue SFCs and page components use PascalCase filenames (`TripInProgress.vue`).
- Composables use `useXxx` naming (`useCurrentLocation.ts`); stores are feature-named (`driverApplication.ts`).
- Use alias imports with `@/` for `src/*` when practical.

## Testing Guidelines
Automated tests are not configured yet. For now:
- Verify core flows manually in web (`npm run dev`) and Android where relevant.
- For logic-heavy additions, include small testable units and propose a Vitest plan in the PR.
- When adding tests later, prefer `*.spec.ts` colocated with source or under `src/__tests__/`.

## Commit & Pull Request Guidelines
Git history is currently minimal (`Initial frontend`), so keep commits clear and focused.
- Commit format: short imperative subject (e.g., `Add driver earnings summary card`).
- Keep one logical change per commit; avoid mixing refactors and features.
- PRs should include: purpose, key changes, manual test steps, and screenshots/videos for UI work.
- Link related issue(s) and call out config/env changes (e.g., new `VITE_*` variables).

## Security & Configuration Tips
- Never commit secrets; keep API keys in local env files only.
- Start from `.env.example` and document any new variables there.
