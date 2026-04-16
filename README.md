# 🚀 Pokémon Stadium Lite - Backend Service

This repository contains the **Backend Service** for the Pokémon Stadium Lite application, a real-time multiplayer Pokémon battle game. 

The backend is built using **Node.js (18+)** and **Express**, with real-time bidirectional communication handled by **Socket.IO**. It connects to a **MongoDB** database (Atlas) to persist lobby states and battle data.

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (18+)
- **Framework:** Express.js
- **Real-time:** Socket.IO
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Architecture:** Clean Architecture (Domain, Application, Infrastructure)
- **Testing:** Vitest

---

## 📂 Project Architecture

The backend strictly adheres to **Clean Architecture** principles to separate concerns:

```text
backend/
├── src/
│   ├── config/               # Environment variables and configuration
│   ├── domain/               # Core business logic and entities
│   │   ├── models/           # TypeScript interfaces (Player, Pokemon, Lobby)
│   │   └── services/         # Pure domain services (BattleService)
│   ├── application/          # Application Use Cases
│   │   └── useCases/         # Atomic operations (Attack, SetReady, Timeout, etc.)
│   ├── infrastructure/       # External integrations and delivery mechanisms
│   │   ├── database/         # Mongoose models and Repositories
│   │   ├── external/         # External API clients (PokemonClient)
│   │   ├── socket/           # Socket.IO event controllers
│   │   └── web/              # Express routes and middlewares
│   └── index.ts              # Application entry point
├── tests/                    # Unit tests
└── package.json
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the `backend` directory based on your environment:

```env
PORT=8080
HOST=0.0.0.0
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pokemon_stadium?retryWrites=true&w=majority
POKEMON_API_URL=https://pokemon-api-92034153384.us-central1.run.app
```

*(Note: The server binds to `0.0.0.0` by default to allow connections from physical mobile devices on the same local network).*

---

## 🚀 Running Locally

1. Ensure you have Node.js 18+ installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (runs with `tsx watch`):
   ```bash
   npm run dev
   ```
4. The server will start on `http://0.0.0.0:8080`.

---

## 🧪 Running Tests

The application includes automated unit tests for the core domain logic (e.g., damage calculation, speed checks, and fainting logic) located in the `tests/` directory.

To run the test suite using Vitest:

```bash
npx vitest run
```

To run tests in watch mode during development:

```bash
npx vitest
```

---

## 🌟 Key Features Implemented

- **Atomic Attacks (Mutex):** The backend uses a logical lock (`isProcessingTurn`) in MongoDB to prevent race conditions if multiple attack requests are received simultaneously.
- **Proactive Timeout Resolution:** A strict 2-minute server-side timer starts on every turn. If the timer expires, the backend proactively declares a winner (the opponent of the inactive player) to ensure the battle always concludes.
- **Automatic Stale Cleanup:** The system detects and resets lobbies that have been inactive for more than 5 minutes, preventing "ghost" sessions from blocking new players.
- **Robust Reconnection:** Players are tracked by a UUID `sessionId`. If their WebSocket disconnects, the state is preserved in MongoDB. When they reconnect with the same `sessionId`, they resume the exact turn and HP state.
- **Global Error Handling:** All HTTP and external API errors are caught by a centralized Express middleware to ensure the server never crashes unexpectedly.
