# JERNI Overview & Architecture

Welcome to JERNI! This document breaks down the project's structure, technology stack, and architectural patterns to help you navigate and build features easily.

---

## 1. High-Level Architecture

JERNI is a monorepo containing a **Next.js frontend** and a **NestJS backend**. It uses **Supabase** for PostgreSQL database hosting and Authentication (JWT).

- **Frontend (`apps/web`)**: Server-Side Rendered React app. Handles UI and session cookies. Never connects directly to the database for application data; instead, it calls the NestJS API.
- **Backend (`apps/api`)**: The core engine. It strictly validates business rules, connects to the database via MikroORM, and exposes a REST API.
- **Supabase**: Issues JWTs when users log in (via the frontend). The frontend passes these JWTs to the backend, which verifies them and executes logic securely.

---

## 2. Monorepo Structure

We use **Turborepo** and **pnpm workspaces** to manage multiple packages in one repository.

```text
JERNI/
├── apps/
│   ├── api/                  #  Backend: NestJS REST API
│   └── web/                  #  Frontend: Next.js Web App
├── packages/
│   └── shared-types/         #  TypeScript interfaces shared by both Web & API
├── turbo.json                # Turborepo build pipeline configuration
├── pnpm-workspace.yaml       # Defines which folders are part of the monorepo
└── tsconfig.base.json        # Base TypeScript config extended by all apps
```

---

## 3. Backend Specs (`apps/api`)

The backend is built with **NestJS** and follows **Domain-Driven Design (DDD)**. This means code is grouped by *business feature* (Contexts) rather than technical type (Controllers/Services).

### Bounded Contexts (`apps/api/src/contexts/`)
Currently, we have 3 main contexts:
1. **`identity`**: User authentication, JWT validation, and user profile syncing.
2. **`curation`**: The core feature—creating Journeys, adding Tasks (Milestones & Recurring), and publishing them.
3. **`media`**: Handles image uploads (covers, avatars) using feature flags (currently disabled, Cloudinary integration is next in Phase 1.5).

### Inside a Context (The DDD Layers)
Every context is split into three strict layers to keep code clean and testable:

1. **`domain/` (The Core)**
   - Pure TypeScript, zero frameworks. Contains business rules.
   - **Aggregates/Entities**: E.g., `Journey`, `TaskDefinition`. They protect their own state (e.g., throwing an error if you try to publish a journey with no tasks).
   - **Value Objects**: E.g., `JourneyId`, `UserId`.

2. **`application/` (The Orchestrator)**
   - Contains Use Cases and Services (e.g., `FeatureFlagService`).
   - Defines **Ports** (Interfaces) like `JourneyRepository` or `MediaStorageProvider`. This layer says *what* needs to be done, but doesn't care *how* it's saved.

3. **`infrastructure/` (The Outside World)**
   - Ties the application to NestJS, databases, and HTTP.
   - **Controllers**: Handle incoming HTTP requests (`GET /journeys`).
   - **Persistence**: MikroORM entities (`journey.orm-entity.ts`) and Repository Adapters that implement the application ports.
   - **Adapters**: E.g., `DisabledMediaAdapter` (or soon, `CloudinaryMediaAdapter`).

---

## 4. Frontend Specs (`apps/web`)

The frontend is a **Next.js 15** application using the App Router.

- **Routing (`src/app/`)**: 
  - `page.tsx` (Discover feed)
  - `journeys/[id]/page.tsx` (Journey Detail page)
- **Auth (`src/lib/supabase/`)**:
  - Uses `@supabase/ssr` to securely store JWTs in HttpOnly cookies.
  - `middleware.ts` automatically refreshes these cookies so users stay logged in.
- **Data Fetching (`src/lib/api-client.ts`)**:
  - A lightweight, typed fetch wrapper used to call the NestJS API.
  - Server Components fetch data directly from the API before sending HTML to the browser.
- **Styling**: Currently using minimal, vanilla CSS in `globals.css` (tokens and variables) to keep things simple until a full UI pass is done.

---

## 5. Development Workflow

### Useful Commands (Run from the root directory)
- **Start the whole stack**: `pnpm dev` (Starts both the Next.js frontend on port 3000 and NestJS API on port 3001).
- **Typecheck**: `pnpm tsc --noEmit`
- **Run Backend Tests**: `pnpm --filter @jerni/api test`

### Database Migrations
We use MikroORM for migrations. 
If you change an ORM entity in `apps/api/src/.../*.orm-entity.ts`:
1. Generate migration: `pnpm --filter @jerni/api exec mikro-orm migration:create`
2. Apply migration: `pnpm --filter @jerni/api exec mikro-orm migration:up`

---

## 6. What's Next? (Phase 1.5)

We have completed Phase 0 (Scaffolding) and Phase 1 (Domain Core & DB). 

**Next up is Phase 1.5: Cloudinary Integration**
- Scaffold `.env` variables for Cloudinary credentials.
- Build the `CloudinaryMediaAdapter` in the backend.
- Create secure, signed upload flows so users can upload Journey Covers directly to Cloudinary, then confirm the ownership with our NestJS API.
