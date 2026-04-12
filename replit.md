# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL (Replit built-in, `DATABASE_URL` env var) — used for journal entries and settings
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## Checkout — Journaling App

### Architecture Overview

Checkout is a calm personal journaling web app. Journal entries and settings are stored in Replit's built-in PostgreSQL database, scoped per Clerk userId. The `journalRepository.ts` file remains the integration seam — swap it to redirect to a different backend (files, Google Drive, etc.) without touching routes or frontend.

### Authentication

Clerk auth is integrated. Each user's journal entries and settings are fully scoped by their Clerk userId in `journalRepository.ts`. All API routes under `/api/journal/*` require a valid Clerk session (401 otherwise).

- Public routes: `/` (landing), `/sign-in`, `/sign-up`
- Protected routes: all journal pages — redirect to `/` if signed out
- Sign-out → redirects to the landing page
- To manage users, configure login providers, or update branding: use the **Auth pane** in the workspace toolbar

### Current Mocked Architecture

```
artifacts/
  checkout/           # React + Vite frontend
    src/
      pages/          # Landing, NewEntry, Home (Journal List), EntryDetail, Settings, SignIn, SignUp
      components/     # Shared UI components (Layout includes user info + sign-out)
      App.tsx         # ClerkProvider + router setup

artifacts/
  api-server/
    src/
      lib/
        journalTypes.ts       # Shared TypeScript interfaces (JournalEntry, StorageSettings, etc.)
        journalMockData.ts    # Mock entries + DAILY_PROMPTS constant — REPLACE THIS with real storage
        journalRepository.ts  # Integration seam — replace implementation to plug in real storage
      routes/
        journal.ts            # Express route handlers for all journal API endpoints

lib/
  api-spec/openapi.yaml       # OpenAPI contract — source of truth for all API shapes
  api-client-react/           # Generated React Query hooks (do not edit manually)
  api-zod/                    # Generated Zod validation schemas (do not edit manually)
```

### Where Real Services Will Plug In

When the Phase 1 shared service layer is complete:

1. **Replace `artifacts/api-server/src/lib/journalRepository.ts`** — swap the mock in-memory implementation with a real `JournalRepository` that delegates to the chosen backend (local files, Google Drive). The interface (listEntries, getEntry, createEntry, updateEntry, getSettings, updateSettings) must stay stable.

2. **Replace `artifacts/api-server/src/lib/journalMockData.ts`** — or simply stop importing it once the real repository reads from actual storage.

3. **Keep `journalTypes.ts` as-is** — the TypeScript types (JournalEntry, StorageSettings, etc.) map to the OpenAPI schema and should stay stable unless the schema changes.

4. **The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the contract** — if new fields or endpoints are added during Phase 1, update the spec first, then re-run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks.

### What to Replace Next (Once Phase 1 Refactor Is Complete)

1. Implement a `LocalFilesRepository` in the api-server that reads/writes markdown files from a configurable local path.
2. Implement a `GoogleDriveRepository` that uses the Google Drive API — the Settings screen is already wired to select this backend.
3. Update `journalRepository.ts` to delegate to the correct backend based on `StorageSettings.backend`.
4. Add OAuth flow for Google Drive (the "Connect Google Drive" button in Settings is already a placeholder).
5. Persist `StorageSettings` somewhere durable (currently in-memory) — a single JSON config file per user is the simplest approach.

### Entry Prompts

1. How present are you right now? (1–10)
2. What was one moment of joy?
3. What was one moment of frustration?
4. Think of your values. One thing you did that aligns with a value?
5. What are you letting go of? What is no longer serving you?
