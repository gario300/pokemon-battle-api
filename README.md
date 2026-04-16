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
│   ├── config/               # Configuration and environment variables
│   ├── domain/               # Core business logic and entities
│   │   ├── models/           # TypeScript interfaces (Player, Pokemon, Lobby)
│   │   └── services/         # Pure domain services (BattleService)
│   ├── application/          # Application Use Cases
│   │   └── useCases/         # Atomic operations (Attack, SetReady, etc.)
│   ├── infrastructure/       # Integrated external systems and delivery
│   │   ├── database/         # Mongoose models and Repositories
│   │   ├── external/         # External API clients (PokemonClient)
│   │   ├── socket/           # Socket.IO event controllers
│   │   └── web/              # Express routes and middlewares
│   └── index.ts              # Entry point
├── tests/                    # Unit tests
└── package.json
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the `backend` directory:

```env
PORT=8080
HOST=0.0.0.0
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pokemon_stadium
POKEMON_API_URL=https://pokemon-api-92034153384.us-central1.run.app
```

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Running Tests

```bash
npx vitest run
```

---

## 🔌 Socket.IO Interface

The application follows an event-driven architecture for real-time synchronization.

### Client-to-Server (Inputs)
- `join_lobby`: Join or reconnect to a lobby with `sessionId` and `nickname`.
- `assign_pokemon`: Requests a randomized team of 3 unique Pokémon.
- `reassign_pokemon`: Requests a new randomized team (resets ready status).
- `ready`: Confirms the team is ready for battle.
- `attack`: Executes an attack during the player's turn.
- `turn_timeout`: Signals that the current turn's timer has reached zero.

### Server-to-Client (Outputs)
- `lobby_status`: Pushes the full `Lobby` object state after any change.
- `battle_start`: Signals the official beginning of a match.
- `turn_result`: Pushes the result of an attack (damage, fainted status).
- `opponent_disconnected`: Notifies a player that their rival has left.
- `opponent_reconnected`: Notifies a player that their rival has returned.
- `error`: Sends error messages to specific clients.

---

## 🌟 Key Features & Patterns

- **Automated Lifecycle (Self-Cleaning):** The server implements an atomic "Match End" cycle. Once a winner is declared, the lobby state is broadcasted as `finished`, and the document is immediately reset to `waiting` to keep the lobby permanently available without manual intervention.
- **Fair Play Victory Logic:** Implemented in `FinishByTimeoutUseCase`. When a timer expires, the server validates player presence. If one player is disconnected, the victory is awarded to the player who remained in the match.
- **Atomic Concurrence (Mutex):** Uses MongoDB's `findOneAndUpdate` to implement a logical lock (`isProcessingTurn`) during turn processing, preventing race conditions.
- **Resilient Sockets:** Uses a `sessionId` persistence pattern. If a socket disconnects, the player's state is preserved, allowing seamless reconnection to the active match.
