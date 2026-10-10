# Desktop Migration Plan

## 1. Existing Architecture Summary
The application is a full-stack web application designed for tutor management.
- **Frontend**: React 19 built with Vite, TailwindCSS, and React Query. Located in `frontend/`.
- **Backend**: Node.js with **Express** (Not NestJS, contrary to initial assumptions) and TypeScript. Located in the root directory (`src/`).
- **Database**: PostgreSQL accessed via Prisma ORM (`prisma/schema.prisma`).
- **API Communication**: REST API using Axios on the frontend.
- **Authentication**: No complex auth mechanism detected (designed for single-user local usage).

## 2. Current Project Directory Structure
```text
/
├── frontend/             # React application (Vite)
├── prisma/               # Database schema and seeds
├── src/                  # Express backend source code
├── package.json          # Backend dependencies
├── frontend/package.json # Frontend dependencies
└── start.command         # Existing macOS startup script (relies on local Node/Postgres)
```

## 3. Dependencies and Versions
- **Frontend**: React (^19.2), Vite (^8.0), Tailwind CSS (^4.3), FullCalendar, React Router.
- **Backend**: Express (^4.21), Prisma (^6.9), TypeScript.

## 4. Current Development and Production Scripts
- **Backend Development**: `npm run dev` (uses nodemon to run `src/server.ts`).
- **Backend Build**: `npm run build` (tsc).
- **Frontend Development**: `npm run dev` (vite).
- **Frontend Build**: `npm run build` (tsc -b && vite build).

## 5. Database Implementation & Required Migration
- **Current**: PostgreSQL (`provider = "postgresql"` in Prisma schema).
- **Risk**: A macOS desktop application cannot reliably assume PostgreSQL is installed, nor can it easily bundle a Postgres server.
- **Action Required**: Migrate the Prisma schema to use **SQLite** (`provider = "sqlite"`). SQLite databases are local file-based and perfectly suited for Electron apps. The DB file will be stored in the Electron `userData` directory to ensure persistence across app updates.

## 6. Environment Variables
- Currently uses `.env` for `DATABASE_URL` and `PORT`.
- In the packaged Electron app, we will programmatically set the SQLite DB path and use dynamic port allocation (or IPC) to avoid port conflicts.

## 7. Authentication Dependencies
- None found. Local app.

## 8. External Services or Cloud Dependencies
- Generates a local iCal feed (`.ics`). No external API keys required for current features.

## 9. Potential Desktop Conversion Risks
- **Database Migration**: Moving from Postgres to SQLite might require minor schema adjustments (e.g., removing Postgres-specific `@db` attributes if any exist).
- **Process Management**: Managing the Node.js Express server lifecycle within Electron (start on launch, kill on exit). If port 3000 is occupied, the app could fail. We will use a dynamically assigned port or Electron IPC.
- **CORS**: Ensure the frontend (running on `file://` or custom protocol) can communicate with the local Express backend.

## 10. Exact Files Requiring Modifications
- `prisma/schema.prisma` (Change provider to `sqlite`).
- Root `package.json` (Add `electron`, `electron-builder`, `concurrently`, `wait-on`).
- `src/server.ts` (Modify to allow dynamic port binding and export server instance).
- Create `electron/main.ts` (Electron lifecycle, window creation, Express startup).
- Create `electron/preload.ts` (IPC bindings).
- `frontend/vite.config.ts` (Set `base: './'` for local file loading).
- `frontend/src/api/axiosClient.ts` or similar (Configure base URL dynamically).

## Execution Strategy (Phase B)
1. **Stage 1: Database Migration**: Switch Prisma to SQLite and verify backend runs.
2. **Stage 2: Electron Setup**: Add Electron dependencies, create main and preload scripts.
3. **Stage 3: Integration**: Bundle the frontend (Vite build) and serve it inside the Electron window, while launching the Express app dynamically in the background.
4. **Stage 4: Packaging**: Configure `electron-builder` to output a `.dmg` for macOS.
