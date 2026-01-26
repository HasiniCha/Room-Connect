# RoomConnect

RoomConnect is a marketplace-style property booking platform with a real-time chat system for tenants and landlords. The stack is a Node/Express backend, a React frontend, MongoDB for chat messages, PostgreSQL for relational data, Redis for caching, RabbitMQ for background work, and Socket.IO for real-time messaging.

## Quick overview
- Backend: Node.js + Express ([backend/src/server.js](backend/src/server.js))
- Frontend: React (Create React App) ([frontend](frontend))
- Real-time chat: Socket.IO + MongoDB for message storage
- Databases & services: PostgreSQL, MongoDB, Redis, RabbitMQ (see `docker-compose.yml`)

## Tech stack
- Node.js, Express
- React, Redux Toolkit
- PostgreSQL, MongoDB, Redis
- RabbitMQ
- Socket.IO
- Stripe (payments)

## Run locally (recommended)
1. Start required services (Postgres, Mongo, Redis, RabbitMQ) with Docker Compose:

```bash
docker-compose up -d
```

2. Backend

```bash
cd backend
npm install
# copy or edit .env (there is an example at backend/.env)
npm run migrate   # optional: run DB migrations
npm run dev       # starts server with nodemon (default PORT in backend/.env is 3001)
```

Or to run multiple backend instances (local clustering):

```bash
npm run start:all
```

3. Frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000 for the frontend; the backend health is at http://localhost:3001/health.

## Environment variables
The backend reads environment variables from `backend/.env`. Important keys:

- `PORT` - backend port (default 3001)
- `FRONTEND_URL` - allowed CORS origin
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Postgres connection
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis connection
- `RABBITMQ_URL` - RabbitMQ connection
- `JWT_SECRET` - JSON Web Token secret
- `STRIPE_SECRET_KEY` - Stripe secret key

See [backend/.env](backend/.env) for a full example.

## Chat feature (how it works)
- Socket server lives in [backend/src/server.js](backend/src/server.js). Sockets are authenticated with `authenticateSocket` middleware.
- Real-time events:
  - `join_chat` — join a room: `chat:<roomId>`
  - `leave_chat` — leave a room
  - `send_message` — server saves message to MongoDB and emits `new_message` to `chat:<roomId>`
  - `typing` — emits `user_typing` to other users in the room
- Messages are persisted in MongoDB via the `ChatMessage` model: [backend/src/models/ChatMessage.js](backend/src/models/ChatMessage.js)
- REST endpoints for chat are under [backend/src/routes/chatRoutes.js](backend/src/routes/chatRoutes.js) and implemented in [backend/src/chat/chatController.js](backend/src/chat/chatController.js)
- Frontend socket usage and UI:
  - Socket client hook: [frontend/src/hooks/useSocket.js](frontend/src/hooks/useSocket.js)
  - Chat UI component: [frontend/src/componenets/Chat.jsx](frontend/src/componenets/Chat.jsx)
  - Chat page: [frontend/src/Pages/ChatPage.jsx](frontend/src/Pages/ChatPage.jsx)
  - Redux slice: [frontend/src/redux/slices/chatSlice.js](frontend/src/redux/slices/chatSlice.js)

## Useful files
- `docker-compose.yml` — DB and service containers
- `backend/src/app.js` — Express app and routes
- `backend/src/server.js` — HTTP + Socket.IO server and connection initialization
- `backend/.env` — example environment variables

## Development tips
- Use `npm run dev` in `backend` for auto-reload during development.
- The frontend is a standard Create React App project: use `npm start` in `frontend`.
- To inspect RabbitMQ management UI, open http://localhost:15672 (default user/password in docker-compose shown in file).

