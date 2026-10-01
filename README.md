# 🎬 SceneTap

**SceneTap** is a daily movie-guessing game: *"Name that movie" meets the TikTok timestamp trend.* A mystery movie hides on a timeline — you tap timestamps to reveal short dialogue exchanges and guess the movie. Fewer taps = more points. Each day features 3 movies, share cards for socials, and a Pro tier ($5/mo).

This repo (`sceneTapJs`) is the TypeScript implementation of the game as a pnpm + Turborepo monorepo.

## Repository structure

| Package | What it is |
|---|---|
| `apps/backend` | Express + TypeScript API server (routes, controllers, services) |
| `apps/frontend` | Next.js 16 + React 19 web app (Tailwind CSS 4) |
| `packages/database` | Prisma ORM layer (Postgres) |
| `packages/shared` | Shared types and Zod validators used by both apps |

## Tech stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Express (Node.js + TypeScript)
- **Database:** PostgreSQL via Prisma
- **Shared contract:** Zod schemas in `@shared/types`

## Getting started

```bash
pnpm install
pnpm dev        # runs both apps (frontend + backend) with turbo
pnpm build      # type-checks and builds everything
```

Database tasks:

```bash
pnpm db:generate      # emit the Prisma client/contract
pnpm db:update        # apply schema updates to the DB
pnpm db:update:dry    # preview DB updates without applying
```

## How the game works

1. A daily round of 3 mystery movies (same set for everyone, midnight reset).
2. You tap points on a movie's timeline to reveal short dialogue exchanges (no audio, no frames).
3. Guess the movie from the revealed lines — fewer taps = more points.
4. Share your score with a generated share card.

*Full product context (concept, plans, validation, legal rules): see the `sceneTap` docs folder next to this repo.*
