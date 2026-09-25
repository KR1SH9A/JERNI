<div align="center">
  <br />
  <img src="./apps/web/public/brand/new-logo.svg" alt="JERNI Logo" width="280" />
  <br />
  <br />
  <p>
    <b>Real discipline, quantified!</b>
  </p>
  <p>
    A beautifully engineered platform for creating, sharing, and tracking curated learning paths.
  </p>
  <br />
</div>

## ✧ What is JERNI?

JERNI is an open-source platform where knowledge meets action. Think of it as a playlist, but instead of songs, you curate **Journeys**—step-by-step learning paths composed of one-off milestones and daily recurring habits. 

Whether you're mastering a new programming language, building a fitness routine, or reading the classics, JERNI lets you build the ultimate roadmap and share it with the community. Join a Journey, check off your tasks, and watch your progress soar.

---

## 🏗️ Architecture & Tech Stack

JERNI is built as a high-performance **Turborepo** monorepo, aggressively separated into a resilient backend and a blazing-fast frontend.

### 🎨 Frontend (`apps/web`)
A modern, Swiss-editorial inspired interface built for speed and aesthetics. 
- **Framework:** Next.js (App Router) 
- **Data Fetching:** TanStack Query for optimistic UI updates and instant cache invalidation.
- **Styling:** Pure Vanilla CSS with a strict, beautifully engineered CSS-variable design system. No Tailwind, just raw CSS mastery, glassmorphism, and fluid typography.
- **Icons:** `lucide-react` for crisp, scalable vector icons.
- **Auth & Realtime:** Supabase SSR for seamless authentication and live WebSocket updates.

### ⚙️ Backend (`apps/api`)
A robust, domain-driven API engineered to handle complex state transitions safely.
- **Framework:** NestJS
- **Architecture:** CQRS (Command Query Responsibility Segregation) & Event-Driven Design.
- **Database:** PostgreSQL orchestrated by **MikroORM**.
- **Domain Logic:** Strictly follows Domain-Driven Design (DDD). We use Aggregate Roots (like `TaskCompletion`) and dispatch Domain Events for side-effects.

### 📦 Shared (`packages/shared-types`)
- End-to-end type safety between the NestJS backend and Next.js frontend, ensuring API contracts are strictly enforced.

---

## ✨ Key Features
- **Curator Mode:** Design intricate journeys with a mix of one-time milestones and daily habits.
- **Participating:** Join community-created journeys and track your progress daily.
- **Optimistic UI:** Tasks check off instantly—the UI never waits for the server to catch up. 
- **Audit-proof Discipline:** Un-checking a task doesn't delete it; it softly revokes the completion, keeping a perfect audit trail of your hard work.

<br/>
<div align="center">
  <sub>Built with ❤️ and a lot of caffeine.</sub>
</div>
