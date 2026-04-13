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
- `pnpm run build` — build all packages (checkout frontend + api-server + mockup-sandbox)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## Checkout — Journaling App

### Architecture Overview

Checkout is a calm personal journaling web app built around an "Evening Checkout" prompt template with 4 daily reflection questions. Journal entries are stored as markdown files in the user's Google Drive via the `rickarm/checkout` backend.

**Deployment model:** Autoscale on a single port (8080). The api-server serves both the API and the built React frontend as static files. In dev, the Vite dev server runs separately for hot reloading.

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

  api-server/                # TypeScript api-server — provides /api/health and /api/healthz
                             # Production run command: node artifacts/api-server/dist/index.mjs
                             # Serves checkout/dist/public as static files in production
                             # Paths: /api, /auth/google (does NOT own /)

lib/
  api-spec/                  # OpenAPI spec (legacy, not used by checkout-backend)
  api-client-react/          # Generated hooks (legacy, not used by new pages)
  api-zod/                   # Zod schemas generated from OpenAPI spec
```

### API Contract (checkout-backend)

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check (no auth) |
| `/api/healthz` | GET | Health check alias (no auth) |
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
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk frontend publishable key

### Authentication

- Clerk handles user authentication (frontend: `@clerk/react`, backend: `@clerk/express`)
- Frontend obtains a Clerk JWT via `getToken()` and sends it as `Authorization: Bearer <token>`
- `VITE_CLERK_PROXY_URL` is set automatically in production by the Replit system
- Public routes: `/` (landing), `/sign-in`, `/sign-up`
- Protected routes: all journal pages — redirect to `/` if signed out
- Google OAuth: must open in a new browser tab (iframe limitation)

### Database

Replit PostgreSQL is used only by the `token-store` in the checkout backend to persist Google Drive refresh tokens per userId. The `user_tokens` table is created automatically by `TokenStore.initialize()`.

Dropped tables (no longer used): `journal_entries`, `journal_settings`.

### Key Technical Notes

- **Express 5**: Uses `/{*splat}` syntax for catch-all routes (not `*`)
- **Import**: Always use `@clerk/react` (not `@clerk/clerk-react`)
- **Vite config**: PORT and BASE_PATH have sensible defaults; no hard throws
- **API client**: `api.ts` uses relative URLs (`BASE = ""`) — do NOT set VITE_API_URL
- **Production static files**: Vite outputs to `artifacts/checkout/dist/public`; api-server serves from `../../checkout/dist/public` relative to its source
- **api-server artifact.toml paths**: `["/api", "/auth/google"]` only — must NOT include `/` to avoid stealing traffic from the checkout web artifact
