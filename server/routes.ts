import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all historical events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllHistoricalEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Create a new game
  app.post("/api/games", async (req, res) => {
    try {
      const game = await storage.createGame();
      
      // Get a random event for the first turn (excluding the starting card)
      const currentEvent = await storage.getRandomHistoricalEvent(game.placedEventIds);
      
      if (currentEvent) {
        await storage.updateGame(game.id, { currentEventId: currentEvent.id });
        game.currentEventId = currentEvent.id;
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  // Get game state
  app.get("/api/games/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Get placed events
      const placedEvents = [];
      for (let i = 0; i < game.placedEventIds.length; i++) {
        const eventId = game.placedEventIds[i];
        const event = await storage.getHistoricalEvent(eventId);
        if (event) {
          placedEvents.push({ event, position: i });
        }
      }

      // Sort placed events by year for proper timeline order
      placedEvents.sort((a, b) => a.event.year - b.event.year);

      // Get current event
      const currentEvent = game.currentEventId 
        ? await storage.getHistoricalEvent(game.currentEventId)
        : null;

      // Get recent moves with event data
      const moves = await storage.getGameMoves(gameId);
      const recentMoves = [];
      for (const move of moves.slice(0, 5)) { // Get last 5 moves
        const event = await storage.getHistoricalEvent(move.eventId);
        if (event) {
          recentMoves.push({ ...move, event });
        }
      }

      const gameState = {
        game,
        placedEvents,
        currentEvent,
        recentMoves
      };

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game state" });
    }
  });

  // Place an event in the timeline
  const placeEventSchema = z.object({
    position: z.number().min(0)
  });

  app.post("/api/games/:gameId/place/:eventId", async (req, res) => {
    try {
      const { gameId, eventId } = req.params;
      const { position } = placeEventSchema.parse(req.body);

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const event = await storage.getHistoricalEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Get the current timeline events sorted by year
      const timelineEvents = [];
      for (const placedEventId of game.placedEventIds) {
        const placedEvent = await storage.getHistoricalEvent(placedEventId);
        if (placedEvent) {
          timelineEvents.push(placedEvent);
        }
      }
      timelineEvents.sort((a, b) => a.year - b.year);

      // Check if placement is correct
      let isCorrect = false;
      
      if (position === 0) {
        // Placing at the beginning
        isCorrect = event.year <= timelineEvents[0].year;
      } else if (position >= timelineEvents.length) {
        // Placing at the end
        isCorrect = event.year >= timelineEvents[timelineEvents.length - 1].year;
      } else {
        // Placing in the middle
        const prevEvent = timelineEvents[position - 1];
        const nextEvent = timelineEvents[position];
        isCorrect = event.year >= prevEvent.year && event.year <= nextEvent.year;
      }

      // Create the move record
      await storage.createGameMove({
        gameId,
        eventId,
        placedPosition: position,
        isCorrect
      });

      if (isCorrect) {
        // Add event to placed events and update score
        const newPlacedEventIds = [...game.placedEventIds];
        newPlacedEventIds.splice(position, 0, eventId);
        
        const newScore = game.score + 1;
        const isCompleted = newScore >= game.targetScore;

        // Get next event if game is not completed
        let nextEventId = null;
        if (!isCompleted) {
          const nextEvent = await storage.getRandomHistoricalEvent([...newPlacedEventIds, eventId]);
          nextEventId = nextEvent?.id || null;
        }

        await storage.updateGame(gameId, {
          score: newScore,
          placedEventIds: newPlacedEventIds,
          currentEventId: nextEventId,
          isCompleted
        });
      } else {
        // Get a new event for the next turn (same event can be tried again or get a different one)
        const nextEvent = await storage.getRandomHistoricalEvent([...game.placedEventIds]);
        const nextEventId = nextEvent?.id || null;
        
        await storage.updateGame(gameId, {
          currentEventId: nextEventId
        });
      }

      res.json({ 
        isCorrect,
        message: isCorrect 
          ? `Correct! ${event.title} (${event.year}) placed successfully.`
          : `Incorrect placement. ${event.title} was in ${event.year}.`
      });
    } catch (error) {
      console.error("Place event error:", error);
      res.status(500).json({ message: "Failed to place event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
