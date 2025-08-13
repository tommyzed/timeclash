import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { IStorage } from "./storage";
import {
  insertGameMoveSchema,
  insertPlayerSchema,
  type WebSocketMessage,
} from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

// WebSocket connection management
const gameRooms = new Map<string, Set<WebSocket>>();
const playerConnections = new Map<string, WebSocket>();

function broadcastToGame(gameId: string, message: WebSocketMessage) {
  const connections = gameRooms.get(gameId);
  if (connections) {
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

export async function registerRoutes(app: Express, storage: IStorage): Promise<Server> {
  // Get all historical events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllHistoricalEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get a specific historical event by ID
  app.get("/api/events/:eventId", async (req, res) => {
    try {
      const { eventId } = req.params;
      const event = await storage.getHistoricalEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Get event error:", error);
      res.status(500).json({ message: "Failed to get event" });
    }
  });

  // Create a new game (single player or with room code for multiplayer)
  app.post("/api/games", async (req, res) => {
    try {
      const { roomCode, singlePlayer } = req.body;

      // For single player games, don't create room codes or player systems
      if (singlePlayer) {
        const game = await storage.createGame(); // No room code for single player

        // Get a random event for the first turn (excluding the starting card)
        const currentEvent = await storage.getRandomHistoricalEvent(
          game.placedEventIds,
        );

        if (currentEvent) {
          await storage.updateGame(game.id, {
            currentEventId: currentEvent.id,
          });
          game.currentEventId = currentEvent.id;
        }

        res.json(game);
      } else {
        // Multiplayer game creation
        const generatedRoomCode =
          roomCode || Math.random().toString(36).substring(2, 8).toUpperCase();
        const game = await storage.createGame(generatedRoomCode);

        // Get a random event for the first turn (excluding the starting card)
        const currentEvent = await storage.getRandomHistoricalEvent(
          game.placedEventIds,
        );

        if (currentEvent) {
          await storage.updateGame(game.id, {
            currentEventId: currentEvent.id,
          });
          game.currentEventId = currentEvent.id;
        }

        res.json(game);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  // Join a game by room code
  app.post("/api/games/join", async (req, res) => {
    try {
      const { roomCode, nickname } = req.body;

      if (!roomCode || !nickname) {
        return res
          .status(400)
          .json({ message: "Room code and nickname are required" });
      }

      const game = await storage.getGameByRoomCode(roomCode);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Create player
      const player = await storage.createPlayer({ nickname });

      // Join the game
      const updatedGame = await storage.joinGame(game.id, player.id);
      if (!updatedGame) {
        return res.status(400).json({ message: "Game is full or unavailable" });
      }

      res.json({ game: updatedGame, playerId: player.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to join game" });
    }
  });

  // Create a player
  app.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  // Get a specific player by ID
  app.get("/api/players/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      console.error("Get player error:", error);
      res.status(500).json({ message: "Failed to get player" });
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

      // Fetch moves once and reuse to avoid N+1 queries
      const allMoves = await storage.getGameMoves(gameId);
      const placedEvents = [] as Array<{
        event: any;
        position: number;
        placedByPlayerId?: string;
        placedByPlayerName?: string;
      }>;
      for (let i = 0; i < game.placedEventIds.length; i++) {
        const eventId = game.placedEventIds[i];
        const event = await storage.getHistoricalEvent(eventId);
        if (!event) continue;
        const placementMove = allMoves.find(
          (move) => move.eventId === eventId && move.isCorrect,
        );
        let placedByPlayerName = undefined as string | undefined;
        if (placementMove && placementMove.playerId !== "single-player") {
          try {
            const player = await storage.getPlayer(placementMove.playerId);
            placedByPlayerName = player?.nickname;
          } catch (error) {
            console.error("Error fetching player for placed event:", error);
          }
        }
        placedEvents.push({
          event,
          position: i,
          placedByPlayerId: placementMove?.playerId,
          placedByPlayerName,
        });
      }

      // Sort placed events by year for proper timeline order
      placedEvents.sort((a, b) => a.event.year - b.event.year);

      // Get current event
      const currentEvent = game.currentEventId
        ? await storage.getHistoricalEvent(game.currentEventId)
        : null;

      // Get recent moves with event data and player names
      const moves = allMoves;
      const recentMoves = [];
      for (const move of moves.slice(0, 5)) {
        // Get last 5 moves
        const event = await storage.getHistoricalEvent(move.eventId);
        if (event) {
          let playerName = undefined;
          
          // Get player name if it's not single-player
          if (move.playerId !== "single-player") {
            try {
              const player = await storage.getPlayer(move.playerId);
              playerName = player?.nickname;
            } catch (error) {
              console.error("Error fetching player for recent move:", error);
            }
          }
          
          recentMoves.push({ ...move, event, playerName });
        }
      }

      // Calculate total incorrect moves for each player
      let playerStats;
      if (game.roomCode) {
        // Multiplayer game - calculate for both players
        const player1IncorrectCount = moves.filter(
          move => move.playerId === game.player1Id && !move.isCorrect
        ).length;
        const player2IncorrectCount = moves.filter(
          move => move.playerId === game.player2Id && !move.isCorrect
        ).length;
        
        playerStats = {
          player1IncorrectCount,
          player2IncorrectCount,
        };
      } else {
        // Single player game
        const player1IncorrectCount = moves.filter(
          move => !move.isCorrect
        ).length;
        
        playerStats = {
          player1IncorrectCount,
          player2IncorrectCount: 0,
        };
      }

      const gameState = {
        game,
        placedEvents,
        currentEvent,
        recentMoves,
        playerStats,
      };

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game state" });
    }
  });

  // Place an event in the timeline
  const placeEventSchema = z.object({
    position: z.number().min(0),
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
        isCorrect =
          event.year >= timelineEvents[timelineEvents.length - 1].year;
      } else {
        // Placing in the middle
        const prevEvent = timelineEvents[position - 1];
        const nextEvent = timelineEvents[position];
        isCorrect =
          event.year >= prevEvent.year && event.year <= nextEvent.year;
      }

      // Create the move record (playerId is optional for single player)
      const { playerId } = req.body;

      // For multiplayer games, ensure playerId is provided and it's their turn
      if (game.roomCode) {
        if (!playerId) {
          return res
            .status(400)
            .json({ message: "Player ID required for multiplayer" });
        }

        // Check if it's the player's turn
        const isPlayer1 = playerId === game.player1Id;
        const isPlayer2 = playerId === game.player2Id;

        if (!isPlayer1 && !isPlayer2) {
          return res
            .status(403)
            .json({ message: "You are not a player in this game" });
        }

        const expectedTurn = isPlayer1 ? "player1" : "player2";
        if (game.currentTurn !== expectedTurn) {
          return res.status(403).json({ message: "It's not your turn" });
        }
      }

      await storage.createGameMove({
        gameId,
        playerId: playerId || "single-player",
        eventId,
        placedPosition: position,
        isCorrect,
      });

      if (isCorrect) {
        // Add event to placed events and update score
        const newPlacedEventIds = [...game.placedEventIds];
        newPlacedEventIds.splice(position, 0, eventId);

        // For multiplayer: update the correct player's score
        let updateData: any = {
          placedEventIds: newPlacedEventIds,
        };

        if (game.roomCode && playerId) {
          // Multiplayer game - update specific player score
          if (playerId === game.player1Id) {
            updateData.player1Score = game.player1Score + 1;
          } else if (playerId === game.player2Id) {
            updateData.player2Score = game.player2Score + 1;
          }

          // Switch turns after correct move
          updateData.currentTurn =
            game.currentTurn === "player1" ? "player2" : "player1";

          // Check for winner
          const newScore =
            playerId === game.player1Id
              ? game.player1Score + 1
              : game.player2Score + 1;
          if (newScore >= game.targetScore) {
            updateData.gameStatus = "completed";
            updateData.winnerPlayerId = playerId;
          }
        } else {
          // Single player game
          const newScore = game.player1Score + 1;
          updateData.player1Score = newScore;

          if (newScore >= game.targetScore) {
            updateData.gameStatus = "completed";
          }
        }

        // Add current event to attempted events list to prevent reuse
        const newAttemptedEventIds = [...(game.attemptedEventIds || []), eventId];
        updateData.attemptedEventIds = newAttemptedEventIds;

        // Get next event if game is not completed
        if (updateData.gameStatus !== "completed") {
          const nextEvent = await storage.getRandomHistoricalEvent([
            ...newPlacedEventIds,
            ...newAttemptedEventIds,
          ]);
          updateData.currentEventId = nextEvent?.id || null;
        } else {
          updateData.currentEventId = null;
        }

        await storage.updateGame(gameId, updateData);
        
        // If game is completed in multiplayer, broadcast game completion
        if (updateData.gameStatus === "completed" && game.roomCode) {
          broadcastToGame(gameId, {
            type: "game_completed",
            data: {
              winnerPlayerId: updateData.winnerPlayerId,
              finalScores: {
                player1: playerId === game.player1Id ? game.player1Score + 1 : game.player1Score,
                player2: playerId === game.player2Id ? game.player2Score + 1 : game.player2Score,
              },
            },
          });
        }
      } else {
        // Wrong answer - switch turns in multiplayer
        let updateData: any = {};

        if (game.roomCode && playerId) {
          // Switch turns after incorrect move
          updateData.currentTurn =
            game.currentTurn === "player1" ? "player2" : "player1";
        }

        // Add current event to attempted events list to prevent reuse
        const newAttemptedEventIds = [...(game.attemptedEventIds || []), eventId];
        updateData.attemptedEventIds = newAttemptedEventIds;

        // Get a new event for the next turn, excluding all attempted events
        const nextEvent = await storage.getRandomHistoricalEvent([
          ...game.placedEventIds,
          ...newAttemptedEventIds,
        ]);
        updateData.currentEventId = nextEvent?.id || null;

        await storage.updateGame(gameId, updateData);
      }

      // Broadcast move to other players in multiplayer games
      if (game.roomCode && playerId) {
        console.log("Broadcasting move_made message:", {
          playerId,
          eventId,
          position,
          isCorrect,
        });
        broadcastToGame(gameId, {
          type: "move_made",
          data: { playerId, eventId, position, isCorrect },
        });
      }

      // Format year for display (B.C. for negative years)
      const displayYear =
        event.year < 0 ? `${Math.abs(event.year)} B.C.` : event.year;

      res.json({
        isCorrect,
        message: isCorrect
          ? `"${event.title}" was in ${displayYear}.`
          : `"${event.title}" was in ${displayYear}.`,
      });
    } catch (error) {
      console.error("Place event error:", error);
      res.status(500).json({ message: "Failed to place event" });
    }
  });

  // Update game settings
  app.patch("/api/games/:gameId/settings", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { targetScore } = req.body;

      if (!targetScore || targetScore < 5 || targetScore > 15) {
        return res
          .status(400)
          .json({ message: "Target score must be between 5 and 15" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Only allow settings changes in waiting/playing state, not completed games
      if (game.gameStatus === "completed") {
        return res
          .status(400)
          .json({ message: "Cannot change settings of completed game" });
      }

      await storage.updateGame(gameId, { targetScore });
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server for real-time multiplayer
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("WebSocket connection established");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join_game":
            const { gameId, playerId } = message.data;

            // Add connection to game room
            if (!gameRooms.has(gameId)) {
              gameRooms.set(gameId, new Set());
            }
            gameRooms.get(gameId)?.add(ws);
            playerConnections.set(playerId, ws);

            // Player may re-join to a different game after a new game is created.
            // Move this socket to the new game's room by removing it from all rooms first.
            gameRooms.forEach((connections) => connections.delete(ws));
            if (!gameRooms.has(gameId)) {
              gameRooms.set(gameId, new Set());
            }
            gameRooms.get(gameId)?.add(ws);

            // Broadcast that player joined with correct identifiers
            const game = await storage.getGame(gameId);
            broadcastToGame(gameId, {
              type: "player_joined",
              data: { playerId, roomCode: game?.roomCode ?? "" },
            });
            break;

          case "make_move":
            const {
              gameId: moveGameId,
              playerId: movePlayerId,
              eventId,
              position,
            } = message.data;

            // Broadcast the move to all connected players
            broadcastToGame(moveGameId, {
              type: "move_made",
              data: {
                playerId: movePlayerId,
                eventId,
                position,
                // This handler only mirrors a client event; correctness is
                // determined by HTTP place endpoint. Use false as placeholder.
                isCorrect: false,
              },
            });
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Invalid message format" },
          }),
        );
      }
    });

    ws.on("close", () => {
      // Remove connection from all game rooms
      gameRooms.forEach((connections, gameId) => {
        connections.delete(ws);
        if (connections.size === 0) {
          gameRooms.delete(gameId);
        }
      });

      // Remove from player connections
      for (const [playerId, connection] of Array.from(
        playerConnections.entries(),
      )) {
        if (connection === ws) {
          playerConnections.delete(playerId);
          break;
        }
      }
    });
  });

  return httpServer;
}
