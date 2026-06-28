# Architecture

> See implementation_plan.md for full phase-by-phase breakdown.

## Stack Overview
- **Frontend**: React 18 + TypeScript + Vite + Redux Toolkit + TailwindCSS
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT (Access + Refresh tokens)
- **Real-time**: Socket.IO
- **Infrastructure**: Docker + Nginx (reverse proxy)

## Module List
auth | users | employees | inventory | categories | warehouse | vendors
purchase | transactions | production | maintenance | reports | notifications | audit