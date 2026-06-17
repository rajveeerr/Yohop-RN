
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start dev server (scan QR with Expo Go)
npx expo start --ios    # iOS simulator
npx expo start --android # Android emulator
npx expo lint           # ESLint (expo lint wraps eslint)
```

No test suite is configured. TypeScript checking: `npx tsc --noEmit`.

## Architecture

**Expo Router (file-based routing)** — `app/` maps 1-to-1 to routes. Route groups:
- `(tabs)/` — consumer tab bar (Home, Explore, Grid, Notifications, Profile)
- `(merchant)/` — merchant dashboard tab bar (Dashboard, Deals, Events, Bookings, Profile)
- All other `app/*.tsx` files are full-screen stack screens registered in `app/_layout.tsx`

**Data layer** — TanStack Query v5 wraps all API calls. Each domain has a dedicated hook in `hooks/` (e.g. `use-auth.ts`, `use-deals.ts`, `use-checkin.ts`). Hooks call functions exported from `services/api.ts`, which is a thin typed fetch wrapper around `EXPO_PUBLIC_API_URL` (default `http://localhost:3000/api`). All responses follow `ApiResponse<T> = { success, data, error }`.

**Auth flow** — `providers/auth-gate.tsx` wraps the whole app. It reads `useMe()` (TanStack Query) and `guestStorage` to decide whether to redirect to `/login`. On 401, `api.ts` fires a global `onUnauthorized` callback (set by `AuthGate`) that clears the token and redirects. JWT is stored in `services/storage.ts` (`tokenStorage`).

**State** — No Redux/Zustand. Merchant onboarding draft state lives in `stores/merchant-draft.ts` as a plain module-level variable with `useSyncExternalStore` for React integration.

**Types** — `services/types.ts` is the single source of truth for all API shapes. Types are annotated against the backend schema doc; fields marked `SCHEMA UNVERIFIED` were inferred and should be confirmed against a live call.

**Backend contract** — The app targets the local `backend/` repo (separate repo), not any hosted service. ID fields are integers on the backend despite appearing as `string` in some places — check `services/types.ts` comments before adding new typed fields.

## Key conventions

- `@/` is the path alias for the project root (configured in `tsconfig.json`).
- Screens import hooks directly; no context providers for server data.
- `merchantStorage` (in `services/storage.ts`) persists the approved merchant profile across sessions and is loaded eagerly in `AuthGate` on mount.
- `guestStorage` controls the "browse without login" mode; `AuthGate` respects it before redirecting to `/login`.
