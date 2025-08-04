# Chronology - Historical Timeline Game

## Overview

Chronology is a single-player educational game where players arrange historical events in chronological order. The application is a full-stack web game built with React and Express, featuring a click-based timeline interface where players select and place historical event cards in the correct temporal sequence. The game tracks scoring based on correct placements and provides immediate feedback on player moves.

## Recent Changes (January 2025)

- **Fixed Critical Gameplay Bug**: Resolved state management issue that prevented drag-and-drop functionality
- **Simplified Interaction Model**: Replaced complex drag-and-drop with intuitive click-to-select and click-to-place system
- **Enhanced Visual Feedback**: Added purple ring indicator for selected cards and clear messaging
- **Centralized State Management**: Moved card selection state to parent Game component for proper data flow
- **Fully Functional Core Gameplay**: Players can now successfully place cards and progress through the game

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