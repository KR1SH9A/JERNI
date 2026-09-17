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
Currently, we have 6 main contexts:
1. **`identity`**: User authentication, JWT validation, and user profile syncing.
2. **`curation`**: The core feature — creating Journeys, adding Tasks (Milestones & Recurring), and publishing them.
3. **`media`**: Handles image uploads (covers, avatars) via Cloudinary using a feature flag toggle (`media_uploads`).
4. **`participation`**: Membership lifecycle — joining and leaving journeys. Enforces the one-active-membership-per-(journey, user) invariant via a DB partial unique index.
5. **`engagement`**: Like/unlike journeys. Fully idempotent. Publishes `JourneyLiked`/`JourneyUnliked` events that drive the denormalized `likeCount` in Curation via the `LikeCountProjection` event handler.
6. **`execution`**: Task completions. The `TaskCompletion` aggregate uses a single DB unique constraint (`UNIQUE NULLS NOT DISTINCT`) to handle both MILESTONE (forDate = NULL, unique once) and RECURRING (forDate = today, resets daily) tasks in one table.

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
   - **Adapters**: E.g., `CloudinaryMediaAdapter`, `DisabledMediaAdapter`.

---

## 4. Frontend Specs (`apps/web`)

The frontend is a **Next.js 15** application using the App Router.

- **Routing (`src/app/`)**:
  - `page.tsx` (Discover feed)
  - `journeys/[id]/page.tsx` (Journey Detail page — fully interactive in Phase 2)
  - `api/journeys/[id]/memberships/route.ts` (Next.js Route Handler — proxies join/leave to NestJS)
  - `api/journeys/[id]/likes/route.ts` (Next.js Route Handler — proxies like/unlike)
  - `api/journeys/[id]/tasks/[taskId]/complete/route.ts` (Next.js Route Handler — proxies task complete/uncomplete)
- **Client Components (`src/components/`)**:
  - `JoinButton` — optimistic join/leave toggle
  - `LikeButton` — optimistic like count with rollback
  - `TaskChecklist` — per-task checkboxes differentiating MILESTONE vs RECURRING (recurring shows today's date label)
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

## 6. What's Next? (Phase 3)

We have completed Phase 0 (Scaffolding), Phase 1 (Domain Core & DB), Phase 1.5 (Cloudinary Integration), Phase 2 (Participation, Execution & Engagement), and are largely finished with **Phase 3 (Stats & Analytics)**.

**Phase 2 added:**
- **Participation context**: `Membership` aggregate, join/leave endpoints, unique-active-membership DB partial index constraint.
- **Engagement context**: `Like` aggregate, idempotent like/unlike, `LikeCountProjection` event handler keeping `likeCount` in sync on Journey cards.
- **Execution context**: `TaskCompletion` aggregate with the milestone/recurring unique-index trick (`UNIQUE NULLS NOT DISTINCT`), `CompleteTask`/`UncompleteTask` use-cases with membership guard, task progress query.
- **Domain events**: `MemberJoined`, `MemberLeft`, `TaskCompleted`, `TaskUncompleted`, `JourneyLiked`, `JourneyUnliked` wired via `@nestjs/cqrs` EventBus.
- **DB migration**: `Migration0002_Phase2` — `memberships`, `likes`, `task_completions` tables with all DB-level constraints applied.
- **Frontend**: `JoinButton`, `LikeButton`, `TaskChecklist` client components; all mutations proxy through Next.js route handlers so the JWT never reaches browser JS.

**Phase 3 added:**
- **Event-driven projections**: Built `DailyStat` (who completed what today) and `AllTimeStat` (completion counts per member) by reacting to `TaskCompleted`/`TaskUncompleted` events — pure read models.
- **Stats endpoint**: `GET /journeys/:id/stats` — Today board + All-time leaderboard, matching the wireframe.
- **Frontend**: `StatsPanel` client component on the Journey detail page fetching live data.
- *(Note: The automated Replay Test for the projection has been postponed for a future pass).*

**Next up is Phase 4: Real-Time Layer**
- **Socket.io gateway**: Room-scoped auth, event bridging from EventBus.
- **Frontend**: Subscribes and updates the Today board / join count live without refresh.
