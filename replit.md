# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## Checkout — Journaling App

### Architecture Overview

Checkout is a calm personal journaling web app built around an "Evening Checkout" prompt template with 4 daily reflection questions. Journal entries are stored as markdown files in the user's Google Drive via the `rickarm/checkout` backend.

### Directory Layout

```
artifacts/
  checkout/                  # React + Vite frontend (port: Replit-assigned)
    src/
      lib/api.ts             # API client — typed fetch + React Query hooks (Clerk JWT)
      pages/
        home.tsx             # Entry list (summaries from /api/entries)
        new-entry.tsx        # Create entry — loads /api/template, POST /api/entries
        entry-detail.tsx     # View/edit — GET+PATCH /api/entries/:id (sections format)
        settings.tsx         # Google Drive connect/disconnect + theme picker
      components/
        journal-page.tsx     # JournalPage, JournalLinearea, JournalContentArea

  checkout-backend/          # rickarm/checkout backend (CommonJS, port 8080)
    bin/api-server.js        # Entry point — multi-user mode (Clerk + Google Drive)
    lib/
      api/
        server.js            # createMultiUserApiServer()
        routes/entries.js    # GET/POST /api/entries, GET/PATCH /api/entries/:id
        serializers.js       # toEntrySummary / toEntryDetail
        middleware/user-service.js  # Per-request GoogleDriveAdapter from token store
      auth/
        clerk.js             # @clerk/express middleware
        google-drive-oauth.js # /auth/google/connect|callback|status
        token-store.js       # PostgreSQL-backed refresh token store
      templates/checkout-v1.json  # 4 questions: presence, joy, values, letgo
      storage/adapters/google-drive-adapter.js

  api-server/                # Legacy TS backend — kept but superseded by checkout-backend
                             # Artifact config now points to checkout-backend

lib/
  api-spec/                  # OpenAPI spec (legacy, not used by checkout-backend)
  api-client-react/          # Generated hooks (legacy, not used by new pages)
```

### API Contract (checkout-backend)

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check (no auth) |
| `/api/template` | GET | Fetch template questions (Clerk auth) |
| `/api/entries` | GET | List entry summaries: `{ entries: [{id, date, templateId, mtime}] }` |
| `/api/entries/:id` | GET | Entry detail: `{ sections: [{title, content}], markdown, ... }` |
| `/api/entries` | POST | Create: `{ date, answers: {presence, joy, values, letgo} }` |
| `/api/entries/:id` | PATCH | Update: `{ answers: {key: value} }` |
| `/auth/google/connect` | GET | Start OAuth flow (redirects to Google) |
| `/auth/google/callback` | GET | OAuth callback — stores refresh token |
| `/auth/google/status` | GET | `{ connected: bool, folderId: string }` |

### Required Secrets (all set)

- `CLERK_SECRET_KEY` — Clerk backend key for `@clerk/express`
- `GOOGLE_CLIENT_ID` — Google OAuth app client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth app client secret
- `GOOGLE_REDIRECT_URI` — Must match Google Cloud Console: `<api-url>/auth/google/callback`
- `CORS_ORIGIN` — Allowed frontend origin (set to deployed app URL)
- `APP_URL` — Frontend URL for post-OAuth redirect

### Environment Variables (shared)

- `VITE_API_URL` — Base URL for API calls from the frontend. Set to the Replit dev domain. In production, the same Replit app domain serves both frontend and backend via path-based routing.

### Authentication

- Clerk handles user authentication (frontend: `@clerk/react`, backend: `@clerk/express`)
- Frontend obtains a Clerk JWT via `getToken()` and sends it as `Authorization: Bearer <token>`
- Public routes: `/` (landing), `/sign-in`, `/sign-up`
- Protected routes: all journal pages — redirect to `/` if signed out

### Database

Replit PostgreSQL is used only by the `token-store` in the checkout backend to persist Google Drive refresh tokens per userId. The `user_tokens` table is created automatically by `TokenStore.initialize()`.

Dropped tables (no longer used): `journal_entries`, `journal_settings`.
