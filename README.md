# ⏳ TimeClash
> **Race through history in the ultimate chronological battle!**

![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Nodejs](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**TimeClash** is a competitive historical timeline game. Put your history knowledge to the test by placing events in their correct chronological order. Play solo to beat your high score, or challenge friends to real-time 1v1 battles where every year counts!

## � Gameplay Demo

<!-- Replace the link below with your video URL or embed -->
![LatestTCDemo-ezgif com-speed](https://github.com/user-attachments/assets/681a48d5-3e89-4c5b-8ac2-81120b2157d8)

> *Check out TimeClash in action!*

## 🕹️ How to Play

1.  **Get a Card**: You're presented with a historical event card (e.g., "Invention of the Lightbulb").
2.  **Place It**: Drag or click to place it on your timeline relative to other events.
    -   *Reference*: "Before the Pyramids" or "After the Moon Landing"?
3.  **Score**: Correct placements earn points. Incorrect ones cost you a strike!
4.  **Win**: Be the first to correctly place **10 cards** to win the game.

## 🔥 Key Features

- **⚔️ Competitive Multiplayer**: Real-time 1v1 battles with live updates.
- **🃏 The "Steal" Mechanic**: If your opponent messes up, you get a chance to steal their turn and place the card yourself!
- **📱 Mobile Optimized**: Play on the go with a sleek, responsive design and a compact 2-line header.
- **🏆 Progressive Difficulty**: Events get obscure as your timeline grows.
- **🌍 Extensive Database**: Thousands of events from ancient history to pop culture.
- **User Profile (with Google Login)**:
    - Track your progress and achievements.
    - View your match history with intuitive pagination.
    - View your friends list with real-time status updates and a vibrant new interface.
    - View your statistics (tracking Multiplayer Wins and Win Rate separately).
- **Mobile Optimized**:
    - Responsive design that adapts to any screen size.
    - Compact 2-line header layout on mobile devices for maximum gameplay area.

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
