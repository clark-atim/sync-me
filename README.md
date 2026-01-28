# Notes Sync App (SyncMe)

## Project Overview

SyncMe is an offline-first, multi-platform note-taking application. Users can create, edit, and delete notes locally, and then manually synchronize them with a central server. The server acts as the authoritative source of truth. This project is built for learning purposes and demonstrates:

- Minimal APIs in .NET for backend
- PostgreSQL for persistent storage
- React for frontend
- Docker for backend and database environment

---

## Features

- Create, edit, and delete notes offline
- Manual sync with server
- Last-write-wins conflict resolution based on `updatedAt` timestamp
- Soft deletes for safe synchronization
- Multi-device capable (single user in MVP)

---

## Project Structure

```
syncme/
│
├── Backend/
│   └── NotesAPI/
│       ├── NotesAPI.csproj
│       ├── Program.cs
│       ├── Dockerfile
│       └── Models/ (Note.cs, DTOs)
│
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.js
│   │   ├── services/ (API calls)
│   │   └── components/
│   └── public/
│
├── docker-compose.yml
└── README.md
```

---

## Business Logic

1. **Client is source of truth while offline**: users can create, edit, delete notes without server connection.
2. **Server is authoritative during sync**: server resolves conflicts based on `updatedAt`.
3. **Soft deletes**: deleted notes are flagged with `isDeleted = true` to ensure safe synchronization.
4. **Synchronization flow**:

```
Client Local Notes → (Push) → Server → (Pull) → Client Local Notes
```

- Push: client sends all local notes to server
- Server updates based on timestamps
- Pull: client fetches authoritative notes from server

5. **Multi-device support**: all devices syncing the same account converge to the same state.

---

## API Endpoints (Minimal API)

| Endpoint  | Method | Purpose                               |
| --------- | ------ | ------------------------------------- |
| `/health` | GET    | Verify backend is running             |
| `/notes`  | GET    | Fetch all notes (authoritative state) |
| `/sync`   | POST   | Push client notes → server            |

---

## Requirements

- Docker & Docker Compose (or `docker compose`) installed
- Node.js (v18+) for React frontend
- .NET 7 SDK (for backend development outside Docker, optional)

---

## Running the Project

### 1. Start backend and PostgreSQL (Docker)

From the project root (`syncme/`):

```bash
docker compose up --build
```

- Backend listens on `http://localhost:5000`
- PostgreSQL listens on `localhost:5432`
- Check backend health:

```bash
curl http://localhost:5000/health
```

Expected output: `ok`

---

### 2. Start React frontend (local dev server)

```bash
cd frontend
npm install
npm start
```

- Opens React app at `http://localhost:3000`
- Frontend communicates with backend at `http://localhost:5000`

---

### 3. Stopping the environment

```bash
docker compose down
```

- Stops containers
- Use `-v` to remove volumes if you want a clean database reset:

```bash
docker compose down -v
```

---

## Notes

- React frontend is **not containerized** for development — hot-reloading works faster locally
- Backend + PostgreSQL are containerized for consistent environment
- All notes synchronization is manual (via sync button)
- Only single-user is implemented in MVP

---

## Next Steps

- Implement Notes API endpoints and DTOs
- Connect React frontend to `/sync` and `/notes`
- Add UI for creating, editing, deleting, and syncing notes
