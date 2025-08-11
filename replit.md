# It's About T⏳️me!! - Historical Timeline Game

## Overview

It's About T⏳️me!! is a single-player educational game where players arrange historical events in chronological order. The application is a full-stack web game built with React and Express, featuring a click-based timeline interface where players select and place historical event cards in the correct temporal sequence. The game tracks scoring based on correct placements and provides immediate feedback on player moves.

## Recent Changes (January 2025)

- **Implemented Complete 2-Player Multiplayer**: Transform from single-player to full real-time multiplayer with room codes
- **Added Turn-Based Gameplay**: Proper turn switching after each move with server-side validation
- **Enhanced Multiplayer UI**: Room code display, separate score tracking, and visual turn indicators
- **Real-Time Communication**: WebSocket integration for live game updates between players
- **Added Room Code Sharing**: One-click copy-to-clipboard functionality for easy game sharing with friends
- **Fixed Turn Management**: Resolved issues with turn indicators and card interaction during opponent's turn
- **Complete B.C. Year Formatting**: All historical years now display proper B.C. notation across all components
- **Crypto-Secure Randomization**: Implemented webcrypto-based randomization for truly random card selection
- **Expanded Historical Dataset**: Added 400+ historical events spanning from 3.3M B.C. to 2022 C.E.
- **Enhanced Card Variety**: Every game now starts with different events ensuring unique gameplay experiences
- **Player-Specific Card Colors**: Blue cards for current player, orange for opponent, visual timeline ownership

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses **React with TypeScript** and follows a component-based architecture with hooks for state management. The UI is built using **shadcn/ui components** (based on Radix UI primitives) with **Tailwind CSS** for styling. Key architectural decisions include:

- **Component Structure**: Modular components for game elements (Timeline, TimelineCard, CurrentCard, FeedbackModal) with clear separation of concerns
- **State Management**: React Query (@tanstack/react-query) for server state management with custom hooks for drag-and-drop functionality
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
The server uses **Express.js with TypeScript** following a RESTful API pattern. The architecture includes:

- **Storage Layer**: In-memory storage implementation with interface abstraction for future database integration
- **Route Organization**: Centralized route registration with proper error handling middleware
- **Development Integration**: Vite middleware integration for seamless full-stack development
- **API Design**: RESTful endpoints for game state management and event operations

### Database Design
Currently uses **in-memory storage** with plans for PostgreSQL integration via Drizzle ORM. The schema includes:

- **Historical Events**: Stores event data (title, description, year, category)
- **Games**: Tracks game state, score, placed events, and completion status
- **Game Moves**: Records individual player moves with correctness tracking
- **Drizzle Configuration**: PostgreSQL dialect configured for future database migration

### Game Logic Architecture
The core game mechanics are implemented with:

- **Event Management**: Curated historical events with random selection excluding already placed cards
- **Scoring System**: Points awarded for correct chronological placement
- **Click-Based Interaction**: Simplified click-to-select and click-to-place system with visual feedback
- **Game State**: Centralized state management in Game component tracking current event, timeline, and player progress
- **Card Selection**: Purple ring visual indicator and state managed at parent component level

### UI/UX Design Patterns
The interface follows modern game design principles:

- **Card-Based Interface**: Visual event cards with gradual reveal of information
- **Progressive Disclosure**: Year information hidden until placement for challenge
- **Immediate Feedback**: Modal dialogs providing instant correctness feedback
- **Responsive Layout**: Grid-based layout adapting to different screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and concurrent features
- **Express.js**: Backend web framework for API server
- **TypeScript**: Type safety across client and server code
- **Vite**: Build tool and development server

### Database & ORM
- **Drizzle ORM**: Type-safe SQL ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **Drizzle-kit**: Database migration and schema management tools

### UI Component Libraries
- **Radix UI**: Headless accessible UI component primitives
- **shadcn/ui**: Pre-built component library based on Radix
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### State Management & Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema definition

### Development & Build Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **PostCSS**: CSS processing and autoprefixing
- **ESBuild**: Fast JavaScript bundler for production builds

### Utility Libraries
- **clsx & class-variance-authority**: Conditional CSS class management
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing library