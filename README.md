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

## 🌟 Key Features

- **Automated Lifecycle:** The server automatically resets the lobby document immediately after a match concludes, ensuring no "zombie" states.
- **Fair Play Victory Logic:** If the 60-second turn timer expires, the server declares a winner based on player presence. The player who stayed in the game always wins over a disconnected opponent.
- **Atomic Attacks:** Logical locks prevent race conditions during concurrent turn processing.
- **Resilient Sockets:** Handles disconnections by preserving state in MongoDB. If all players leave, the lobby is instantly cleared.
