# TimeClash

**TimeClash** is an engaging historical timeline game where players race to correctly place historical events in chronological order. Test your knowledge of history in single-player mode or challenge friends in real-time multiplayer battles!

## 🎮 Features

- **Single Player Mode**: 
    - Test your skills against the timeline.
    - Enable "Hard Mode" for a more challenging experience.
- **Multiplayer Mode**: 
    - Real-time 1v1 gameplay.
    - Room code system for easy matchmaking.
    - "Steal" mechanic: If an opponent makes a mistake, you get a chance to place their card!
    - Add an opponent as a friend to quickly create new games!
- **Dynamic Gameplay**:
    - Randomized events ensuring no two games are alike.
    - Visual feedback for correct and incorrect moves.
    - Smooth drag-and-drop or click-to-place interface.
- **Historical Database**:
    - Extensive collection of events ranging from ancient B.C. eras to modern times.
    - Informative descriptions for every event.
- **User Profile (with Google Login)**:
    - Track your progress and achievements.
    - View your match history.
    - View your friends list.
    - View your statistics.

## 🛠️ Technology Stack

This project is built with a modern full-stack TypeScript architecture:

### Frontend
- **React 18**: Core UI library.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS**: Utility-first styling.
- **shadcn/ui**: Accessible and customizable UI components (based on Radix UI).
- **TypeScript**: For type-safe code.
- **Wouter**: Lightweight routing.
- **TanStack Query**: Efficient server state management.

### Backend
- **Express.js**: Fast and minimalist web framework for Node.js.
- **WebSocket (ws)**: Real-time bidirectional communication for multiplayer features.
- **TypeScript**: Shared types between client and server.

### Database
- **Drizzle ORM**: Type-safe ORM.
- **PostgreSQL**: (Production) Reliable relational database.
- **In-Memory**: (Development default) Quick start without external dependencies.

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Installation

1.  Clone the repository (or download the source).
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the development server:
```bash
npm run dev
```
This command starts:
- The backend server on port 5000.
- The frontend Vite server (proxied through the backend).

Open your browser and navigate to `http://localhost:5000`.

## 📂 Project Structure

- **`client/`**: React frontend code.
    - `src/components/`: Reusable UI components.
    - `src/pages/`: Main application views (Home, Game, Lobby).
    - `src/lib/`: Utilities and helpers.
- **`server/`**: Express backend code.
    - `routes.ts`: API and WebSocket route definitions.
    - `storage.ts`: Data persistence layer.
    - `services/`: Game logic, state management, and validation.
- **`shared/`**: Code shared between client and server (types, schemas).

## 📄 License

MIT License
