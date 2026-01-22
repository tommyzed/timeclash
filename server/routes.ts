import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { IStorage } from "./storage";
import { OAuth2Client } from "google-auth-library";
import {
  insertGameMoveSchema,
  insertPlayerSchema,
  type WebSocketMessage,
  type Game,
} from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

// Import services
import { getGameState, getTimelineEvents } from "./services/gameState";
import {
  isPlacementCorrect,
  handleSuccessfulSteal,
  handleMultiplayerCorrectMove,
  handleSinglePlayerCorrectMove,
  handleFailedSteal,
  handleStealingMode,
  handleIncorrectMove,
  handleSinglePlayerIncorrectMove,
  getNextEvent,
} from "./services/gameLogic";
import {
  validateMultiplayerTurn,
  validateSettingsUpdate,
  formatYear,
} from "./services/validation";
import {
  broadcastToGame,
  addPlayerToGameRoom,
  removePlayerConnection,
  sendToOpponent,
  gameRooms,
} from "./services/websocket";

export async function registerRoutes(
  app: Express,
  storage: IStorage
): Promise<Server> {
  const googleClient = new OAuth2Client();

  // ========== AUTH ROUTES ==========

  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token } = req.body;
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ message: "Invalid token" });
      }

      let user = await storage.getUserByGoogleId(payload.sub);
      if (!user) {
        user = await storage.createUser({
          googleId: payload.sub,
          email: payload.email!,
          name: payload.name!,
          picture: payload.picture,
        });
      }

      (req.session as any).userId = user.id;
      res.json(user);
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ message: "Failed to authenticate with Google" });
    }
  });

  app.get("/api/auth/session", async (req, res) => {
    if ((req.session as any).userId) {
      const user = await storage.getUser((req.session as any).userId);
      res.json(user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.patch("/api/users/me", async (req, res) => {
    if (!(req.session as any).userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = (req.session as any).userId;
      const { name } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Name is required" });
      }

      const updatedUser = await storage.updateUser(userId, { name });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.json({ message: "Logged out" });
    });
  });

  // ========== EVENT ROUTES ==========

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllHistoricalEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

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

  // ========== GAME ROUTES ==========

  app.post("/api/games", async (req, res) => {
    try {
      const { roomCode, singlePlayer, gameMode, targetScore, categories, eras } =
        req.body;

      // Get userId from session if user is logged in
      const userId = (req.session as any).userId;

      const gameConfig = {
        gameMode,
        targetScore,
        categories,
        eras,
        player1UserId: userId, // Link game to user (Player 1) if logged in
      };

      // Create game based on mode
      const game = singlePlayer
        ? await storage.createGame(gameConfig)
        : await storage.createGame({
          ...gameConfig,
          roomCode:
            roomCode ||
            Math.random().toString(36).substring(2, 8).toUpperCase(),
        });

      // Get initial event
      const currentEvent = await storage.getRandomHistoricalEvent(
        game.placedEventIds,
        game.categories,
        game.eras
      );

      if (currentEvent) {
        await storage.updateGame(game.id, {
          currentEventId: currentEvent.id,
        });
        game.currentEventId = currentEvent.id;
      }

      res.json(game);
    } catch (error) {
      console.error("Create game error:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.post("/api/games/challenge", async (req, res) => {
    try {
      const { friendUserId } = req.body;
      const userId = (req.session as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Verify friendship
      const friendships = await storage.getFriendships(userId);
      const isFriend = friendships.some(f =>
        (f.userId1 === userId && f.userId2 === friendUserId && f.status === 'accepted') ||
        (f.userId1 === friendUserId && f.userId2 === userId && f.status === 'accepted')
      );

      if (!isFriend) {
        return res.status(403).json({ message: "Not friends with this user" });
      }

      // Get Users
      const myUser = await storage.getUser(userId);
      const friendUser = await storage.getUser(friendUserId);

      if (!myUser || !friendUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create Game
      const gameConfig = {
        player1UserId: userId,
        player2UserId: friendUserId, // Pre-set player 2 as well
        roomCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        gameMode: "normal",
        targetScore: 10,
        categories: ["Politics", "Science", "History", "Culture"],
        eras: ["Ancient", "Classical", "Modern"],
      };

      const game = await storage.createGame(gameConfig);

      // Create Players
      const p1 = await storage.createPlayer({ nickname: myUser.name, color: "blue" });
      const p2 = await storage.createPlayer({ nickname: friendUser.name, color: "orange" });

      // Join Players
      await storage.joinGame(game.id, p1.id, userId); // Join me
      await storage.joinGame(game.id, p2.id, friendUserId); // Join friend

      // Get initial event
      const currentEvent = await storage.getRandomHistoricalEvent(
        game.placedEventIds,
        game.categories,
        game.eras
      );

      if (currentEvent) {
        await storage.updateGame(game.id, {
          currentEventId: currentEvent.id,
        });
      }

      // Notify friend if online (optional, via WebSocket if implemented)
      // broadcastToUser(friendUserId, { type: 'new_game_started', data: { gameId: game.id } }); 

      res.json(game);
    } catch (error) {
      console.error("Challenge game error:", error);
      res.status(500).json({ message: "Failed to create challenge game" });
    }
  });

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

      // Determine player role and assign color
      const isPlayer1 = !game.player1Id;
      const playerColor = isPlayer1 ? "blue" : "orange";

      // Create player
      const player = await storage.createPlayer({ nickname });
      await storage.updatePlayerColor(player.id, playerColor);

      // Get userId from session if user is logged in (Player 2)
      const userId = (req.session as any).userId;

      // Join the game, passing userId if available
      const updatedGame = await storage.joinGame(game.id, player.id, userId);
      if (!updatedGame) {
        return res.status(400).json({ message: "Game is full or unavailable" });
      }

      console.log("Updated game state on join:", updatedGame);

      // Broadcast the player joined event to the room
      broadcastToGame(game.id, {
        type: "player_joined",
        data: { playerId: player.id, roomCode: game.roomCode as string },
      });

      res.json({ game: updatedGame, playerId: player.id });
    } catch (error) {
      console.error("Join game error:", error);
      res.status(500).json({ message: "Failed to join game" });
    }
  });

  app.get("/api/games/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const gameState = await getGameState(storage, gameId);
      if (!gameState) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(gameState);
    } catch (error) {
      console.error("Fetch game state error:", error);
      res.status(500).json({ message: "Failed to fetch game state" });
    }
  });

  // ========== USER GAME ROUTES ==========

  // Get current user's active games
  app.get("/api/users/me/games", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const activeGames = await storage.getGamesByUserId(userId, "playing");
      const waitingGames = await storage.getGamesByUserId(userId, "waiting");

      // Enrich games with player names
      const enrichGames = async (games: Game[]) => {
        return Promise.all(
          games.map(async (game) => {
            const player1 = game.player1Id ? await storage.getPlayer(game.player1Id) : null;
            const player2 = game.player2Id ? await storage.getPlayer(game.player2Id) : null;

            return {
              ...game,
              player1Name: player1?.nickname,
              player2Name: player2?.nickname,
            };
          })
        );
      };

      const enrichedActiveGames = await enrichGames(activeGames);
      const enrichedWaitingGames = await enrichGames(waitingGames);

      res.json({
        activeGames: enrichedActiveGames,
        waitingGames: enrichedWaitingGames,
        total: activeGames.length + waitingGames.length
      });
    } catch (error) {
      console.error("Fetch user games error:", error);
      res.status(500).json({ message: "Failed to fetch user games" });
    }
  });

  // Get current user's game history
  app.get("/api/users/me/history", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await storage.getUserGameHistory(userId, limit, offset);

      // Enrich history with player names
      const enrichedHistory = await Promise.all(
        history.map(async (game) => {
          const player1 = game.player1Id ? await storage.getPlayer(game.player1Id) : null;
          const player2 = game.player2Id ? await storage.getPlayer(game.player2Id) : null;

          return {
            ...game,
            player1Name: player1?.nickname,
            player2Name: player2?.nickname,
          };
        })
      );

      res.json({
        games: enrichedHistory,
        limit,
        offset,
      });
    } catch (error) {
      console.error("Fetch user history error:", error);
      res.status(500).json({ message: "Failed to fetch user history" });
    }
  });

  // Get current user's statistics
  app.get("/api/users/me/stats", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const allGames = await storage.getGamesByUserId(userId);
      const completedGames = allGames.filter(g => g.gameStatus === "completed");

      // Calculate wins (games where user won)
      // Calculate wins (games where user won)
      const wins = completedGames.filter(game => {
        // For single player games, check if game was completed successfully
        if (!game.roomCode) {
          return game.gameStatus === "completed" && !game.winnerPlayerId;
        }
        // For multiplayer, check if user's player won
        if (!game.winnerPlayerId) return false;

        const isPlayer1 = game.player1UserId === userId;
        const isPlayer2 = game.player2UserId === userId;

        if (isPlayer1) return game.winnerPlayerId === game.player1Id;
        if (isPlayer2) return game.winnerPlayerId === game.player2Id;

        return false;
      }).length;

      const losses = completedGames.length - wins;

      res.json({
        totalGames: allGames.length,
        completedGames: completedGames.length,
        activeGames: allGames.filter(g => g.gameStatus === "playing" || g.gameStatus === "waiting").length,
        wins,
        losses,
        winRate: completedGames.length > 0 ? (wins / completedGames.length) * 100 : 0,
      });
    } catch (error) {
      console.error("Fetch user stats error:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Abandon a game (mark as abandoned, don't delete)
  app.post("/api/games/:gameId/abandon", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gameId } = req.params;
      const game = await storage.getGame(gameId);

      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Verify the user owns/is in this game
      if (game.player1UserId !== userId && game.player2UserId !== userId) {
        return res.status(403).json({ message: "Not authorized to abandon this game" });
      }

      // Only allow abandoning active/waiting games
      if (game.gameStatus === "completed" || game.gameStatus === "abandoned") {
        return res.status(400).json({ message: "Game is already finished" });
      }

      await storage.updateGame(gameId, { gameStatus: "abandoned" });

      res.json({ message: "Game abandoned successfully" });
    } catch (error) {
      console.error("Abandon game error:", error);
      res.status(500).json({ message: "Failed to abandon game" });
    }
  });

  // ========== PLACE EVENT ROUTE ==========

  const placeEventSchema = z.object({
    position: z.number().min(0),
  });

  app.post("/api/games/:gameId/place/:eventId", async (req, res) => {
    try {
      const { gameId, eventId } = req.params;
      const { position } = placeEventSchema.parse(req.body);
      const { playerId } = req.body;

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const event = await storage.getHistoricalEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Validate turn for multiplayer games
      if (game.roomCode) {
        const turnValidation = validateMultiplayerTurn(game, playerId);
        if (!turnValidation.valid) {
          return res.status(403).json({ message: turnValidation.error });
        }
      }

      // Get timeline and check if placement is correct
      const timelineEvents = await getTimelineEvents(
        storage,
        game.placedEventIds
      );
      const isCorrect = isPlacementCorrect(event.year, position, timelineEvents);

      // Create move record
      await storage.createGameMove({
        gameId,
        playerId: playerId || "single-player",
        eventId,
        placedPosition: position,
        isCorrect,
      });

      let gameCompleted = false;

      if (isCorrect) {
        // Handle correct placement
        const updateData = await handleCorrectPlacement(
          storage,
          game,
          playerId,
          position,
          eventId
        );

        updateData.lastMovedAt = new Date();
        await storage.updateGame(gameId, updateData);

        // Broadcast if game completed in multiplayer
        if (updateData.gameStatus === "completed" && game.roomCode) {
          gameCompleted = true;
          const finalGameState = await getGameState(storage, gameId);
          if (finalGameState) {
            broadcastToGame(gameId, {
              type: "game_updated",
              data: finalGameState,
            });
          }
        } else if (!game.roomCode) {
          // Broadcast for single-player
          broadcastToGame(gameId, {
            type: "move_made",
            data: {
              playerId: "single-player",
              eventId,
              position,
              isCorrect,
            },
          });
        }
      } else {
        // Handle incorrect placement
        const updateData = await handleIncorrectPlacement(
          storage,
          game,
          playerId,
          eventId
        );

        updateData.lastMovedAt = new Date();
        await storage.updateGame(gameId, updateData);
      }

      // Broadcast move to other players in multiplayer games
      if (game.roomCode && playerId && !gameCompleted) {
        broadcastToGame(gameId, {
          type: "move_made",
          data: { playerId, eventId, position, isCorrect },
        });
      }

      res.json({
        isCorrect,
        message: `"${event.title}" was in ${formatYear(event.year)}.`,
      });
    } catch (error) {
      console.error("Place event error:", error);
      res.status(500).json({ message: "Failed to place event" });
    }
  });

  // ========== SETTINGS ROUTE ==========

  app.patch("/api/games/:gameId/settings", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { targetScore, gameMode, allowStealing, categories, eras } =
        req.body;

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      if (game.gameStatus === "completed") {
        return res
          .status(400)
          .json({ message: "Cannot change settings of completed game" });
      }

      // Validate settings
      const validation = validateSettingsUpdate({
        targetScore,
        categories,
        eras,
      });
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      const updateData = buildSettingsUpdate(
        game,
        targetScore,
        gameMode,
        allowStealing,
        categories,
        eras
      );

      if (Object.keys(updateData).length > 0) {
        const oldSettings = {
          targetScore: game.targetScore,
          allowStealing: game.allowStealing,
          categories: game.categories,
          eras: game.eras,
        };

        await storage.updateGame(gameId, updateData);
        const newSettings = { ...oldSettings, ...updateData };

        const changes = detectSettingsChanges(oldSettings, newSettings);

        if (changes.length > 0) {
          broadcastToGame(gameId, {
            type: "settings_changed",
            data: { changes, updaterPlayerId: req.body.playerId },
          });
        }
      }
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // ========== PLAYER ROUTES ==========

  app.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error) {
      console.error("Create player error:", error);
      res.status(500).json({ message: "Failed to create player" });
    }
  });

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

  app.post("/api/players/:playerId/color", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { color } = req.body;

      if (!color) {
        return res.status(400).json({ message: "Color is required" });
      }

      const updatedPlayer = await storage.updatePlayerColor(playerId, color);

      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Find the game this player is in
      const game = await storage.getGameByPlayerId(playerId);
      if (game) {
        broadcastToGame(game.id, {
          type: "player_color_changed",
          data: { playerId, color },
        });
      }

      res.json(updatedPlayer);
    } catch (error) {
      console.error("Update player color error:", error);
      res.status(500).json({ message: "Failed to update player color" });
    }
  });

  // ========== GAME CLAIMING ==========

  app.post("/api/games/:gameId/claim", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.body;
      const userId = (req.session as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      let updateData: Partial<Game> = {};
      let alreadyClaimed = false;

      if (!playerId) {
        // Single player claim attempt
        // In single player, player1Id is null.
        if (game.player1Id === null) {
          if (game.player1UserId && game.player1UserId !== userId) {
            return res.status(409).json({ message: "Game already claimed by another user." });
          }
          // Check if already claimed by this same user
          if (game.player1UserId === userId) {
            alreadyClaimed = true;
          } else {
            updateData.player1UserId = userId;
          }
        } else {
          // If playerId is not provided but game has player1Id, it's a multiplayer game/lobby
          // and we can't blindly claim it without knowing WHICH player they are.
          return res.status(400).json({ message: "Player ID required for multiplayer games." });
        }
      } else {
        // Multiplayer claim attempt (or single player if we ever add IDs there)
        if (game.player1Id === playerId) {
          if (game.player1UserId && game.player1UserId !== userId) {
            return res.status(409).json({ message: "Player 1 already claimed by another user." });
          }
          // Check if already claimed by this same user
          if (game.player1UserId === userId) {
            alreadyClaimed = true;
          } else {
            updateData.player1UserId = userId;
          }
        } else if (game.player2Id === playerId) {
          if (game.player2UserId && game.player2UserId !== userId) {
            return res.status(409).json({ message: "Player 2 already claimed by another user." });
          }
          // Check if already claimed by this same user
          if (game.player2UserId === userId) {
            alreadyClaimed = true;
          } else {
            updateData.player2UserId = userId;
          }
        } else {
          return res.status(403).json({ message: "Player not found in this game" });
        }
      }

      // Perform the update only if there are actual changes
      if (Object.keys(updateData).length > 0) {
        await storage.updateGame(gameId, updateData);
      }

      const updatedGame = await storage.getGame(gameId);
      // Return whether a claim actually occurred (vs already claimed by same user)
      res.json({ ...updatedGame, claimed: !alreadyClaimed && Object.keys(updateData).length > 0 });

    } catch (error) {
      console.error("Claim game error:", error);
      res.status(500).json({ message: "Failed to claim game" });
    }
  });

  // ========== FRIENDSHIP ROUTES ==========

  // List friends and pending requests
  app.get("/api/friends", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const requests = await storage.getFriendships(userId);

      // Enrich with user data
      const enrichedRequests = await Promise.all(
        requests.map(async (f) => {
          const otherUserId = f.userId1 === userId ? f.userId2 : f.userId1;
          const otherUser = await storage.getUser(otherUserId);
          return {
            ...f,
            otherUser: otherUser ? {
              id: otherUser.id,
              name: otherUser.name,
              picture: otherUser.picture,
              email: otherUser.email
            } : null
          };
        })
      );

      res.json(enrichedRequests);
    } catch (error) {
      console.error("Fetch friends error:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  // Send friend request
  app.post("/api/friends/request", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ message: "Target user ID is required" });
      }

      if (userId === targetUserId) {
        return res.status(400).json({ message: "Cannot send friend request to yourself" });
      }

      // Check existing friendship
      const existing = await storage.getFriendship(userId, targetUserId);
      if (existing) {
        return res.status(409).json({ message: "Friendship request already exists", friendship: existing });
      }

      const friendship = await storage.createFriendship(userId, targetUserId); // userId1=sender, userId2=receiver

      // Notify target user if they are online in a game
      const activeGames = await storage.getGamesByUserId(userId, "playing");
      const commonGame = activeGames.find(g =>
        (g.player1UserId === targetUserId || g.player2UserId === targetUserId) && g.roomCode
      );

      if (commonGame) {
        const sender = await storage.getUser(userId);
        broadcastToGame(commonGame.id, {
          type: "friend_request",
          data: {
            requesterId: userId,
            requesterName: sender?.name || "A friend"
          }
        });
      }

      res.json(friendship);
    } catch (error) {
      console.error("Send friend request error:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  // Respond to friend request (accept)
  app.post("/api/friends/:friendshipId/accept", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { friendshipId } = req.params;
      const friendship = (await storage.getFriendships(userId)).find(f => f.id === friendshipId);

      if (!friendship) {
        return res.status(404).json({ message: "Friendship request not found" });
      }

      if (friendship.userId2 !== userId) {
        return res.status(403).json({ message: "You can only accept requests sent to you" });
      }

      const updated = await storage.updateFriendshipStatus(friendshipId, "accepted");
      res.json(updated);
    } catch (error) {
      console.error("Accept friend request error:", error);
      res.status(500).json({ message: "Failed to accept request" });
    }
  });

  // Delete/Deny friend request
  app.delete("/api/friends/:friendshipId", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { friendshipId } = req.params;
      const friendship = (await storage.getFriendships(userId)).find(f => f.id === friendshipId);

      if (!friendship) {
        return res.status(404).json({ message: "Friendship not found" });
      }

      // Allow deletion if user is either sender or receiver
      await storage.deleteFriendship(friendshipId);
      res.json({ message: "Friendship/Request deleted" });
    } catch (error) {
      console.error("Delete friend error:", error);
      res.status(500).json({ message: "Failed to delete friendship" });
    }
  });

  // ========== WEBSOCKET SETUP ==========

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("WebSocket connection established");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join_game":
            await handleJoinGame(storage, ws, message.data);
            break;

          case "make_move":
            handleMakeMove(message.data);
            break;

          case "new_game_request":
            await handleNewGameRequest(storage, ws, message.data);
            break;

          case "new_game_response":
            await handleNewGameResponse(storage, ws, message.data);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            data: { message: "Invalid message format" },
          })
        );
      }
    });

    ws.on("close", () => {
      removePlayerConnection(ws);
    });
  });

  return httpServer;
}

// ========== HELPER FUNCTIONS ==========

async function handleCorrectPlacement(
  storage: IStorage,
  game: Game,
  playerId: string | undefined,
  position: number,
  eventId: string
): Promise<Partial<Game>> {
  const newPlacedEventIds = [...game.placedEventIds];
  newPlacedEventIds.splice(position, 0, eventId);

  let updateData: Partial<Game>;

  if (game.stealingPlayerId) {
    updateData = handleSuccessfulSteal(game, playerId!, newPlacedEventIds);
  } else if (game.roomCode && playerId) {
    updateData = handleMultiplayerCorrectMove(game, playerId, newPlacedEventIds);
  } else {
    updateData = handleSinglePlayerCorrectMove(
      game,
      playerId,
      newPlacedEventIds
    );
  }

  // Add attempted events
  const newAttemptedEventIds = [...(game.attemptedEventIds || []), eventId];
  updateData.attemptedEventIds = newAttemptedEventIds;

  // Get next event if game not completed
  if (updateData.gameStatus !== "completed") {
    updateData.currentEventId = await getNextEvent(
      storage,
      game,
      newPlacedEventIds,
      newAttemptedEventIds,
      false
    );
  } else {
    updateData.currentEventId = null;
  }

  return updateData;
}

async function handleIncorrectPlacement(
  storage: IStorage,
  game: Game,
  playerId: string | undefined,
  eventId: string
): Promise<Partial<Game>> {
  let updateData: Partial<Game> = {};

  if (game.roomCode && playerId) {
    if (game.stealingPlayerId) {
      updateData = handleFailedSteal(game);
    } else if (game.allowStealing) {
      updateData = handleStealingMode(game);
    } else {
      updateData = handleIncorrectMove(game);
    }
  } else if (game.gameMode === "hard") {
    updateData = handleSinglePlayerIncorrectMove(game);
  }

  // Add attempted events
  const newAttemptedEventIds = [...(game.attemptedEventIds || []), eventId];
  updateData.attemptedEventIds = newAttemptedEventIds;

  // Get next event if game not completed
  if (updateData.gameStatus !== "completed") {
    const inStealingMode = !!updateData.stealingPlayerId;
    updateData.currentEventId = await getNextEvent(
      storage,
      game,
      game.placedEventIds,
      newAttemptedEventIds,
      inStealingMode
    );
  } else {
    updateData.currentEventId = null;
  }

  return updateData;
}

function buildSettingsUpdate(
  game: Game,
  targetScore?: number,
  gameMode?: "normal" | "hard",
  allowStealing?: boolean,
  categories?: string[],
  eras?: string[]
): Partial<Game> {
  const updateData: Partial<Game> = {};

  if (targetScore !== undefined) {
    updateData.targetScore = targetScore;
  }

  if (allowStealing !== undefined) {
    updateData.allowStealing = allowStealing;
  }

  if (categories !== undefined) {
    updateData.categories = categories;
  }

  if (eras !== undefined) {
    updateData.eras = eras;
  }

  if (gameMode !== undefined && !game.roomCode) {
    updateData.gameMode = gameMode;
    if (gameMode === "hard") {
      const scoreForAttempts =
        targetScore !== undefined ? targetScore : game.targetScore;
      updateData.maxAttempts = Math.floor(scoreForAttempts * 1.5);
      updateData.attempts = 0;
    } else {
      updateData.maxAttempts = null;
    }
  } else if (targetScore !== undefined && game.gameMode === "hard") {
    updateData.maxAttempts = Math.floor(targetScore * 1.5);
  }

  return updateData;
}

function detectSettingsChanges(
  oldSettings: any,
  newSettings: any
): Array<{ setting: string; from: any; to: any }> {
  const changes: Array<{ setting: string; from: any; to: any }> = [];

  if (oldSettings.targetScore !== newSettings.targetScore) {
    changes.push({
      setting: "Target Score",
      from: oldSettings.targetScore,
      to: newSettings.targetScore,
    });
  }

  if (oldSettings.allowStealing !== newSettings.allowStealing) {
    changes.push({
      setting: "Allow Stealing",
      from: oldSettings.allowStealing,
      to: newSettings.allowStealing,
    });
  }

  if (
    JSON.stringify(oldSettings.categories.sort()) !==
    JSON.stringify(newSettings.categories.sort())
  ) {
    changes.push({
      setting: "Categories",
      from: oldSettings.categories,
      to: newSettings.categories,
    });
  }

  if (
    JSON.stringify(oldSettings.eras.sort()) !==
    JSON.stringify(newSettings.eras.sort())
  ) {
    changes.push({
      setting: "Eras",
      from: oldSettings.eras,
      to: newSettings.eras,
    });
  }

  return changes;
}

// ========== WEBSOCKET HANDLERS ==========

async function handleJoinGame(
  storage: IStorage,
  ws: WebSocket,
  data: { gameId: string; playerId: string }
) {
  const { gameId, playerId } = data;
  console.log("Player joining game:", { gameId, playerId });

  addPlayerToGameRoom(gameId, playerId, ws);

  const game = await storage.getGame(gameId);
  broadcastToGame(gameId, {
    type: "player_joined",
    data: { playerId, roomCode: game?.roomCode ?? "" },
  });
}

function handleMakeMove(data: {
  gameId: string;
  playerId: string;
  eventId: string;
  position: number;
}) {
  const { gameId: moveGameId, playerId: movePlayerId, eventId, position } = data;

  broadcastToGame(moveGameId, {
    type: "move_made",
    data: {
      playerId: movePlayerId,
      eventId,
      position,
      isCorrect: false, // Placeholder - correctness determined by HTTP endpoint
    },
  });
}

async function handleNewGameRequest(
  storage: IStorage,
  ws: WebSocket,
  data: { gameId: string; requestingPlayerId: string; requestingPlayerName: string }
) {
  const { gameId, requestingPlayerId, requestingPlayerName } = data;

  const currentGame = await storage.getGame(gameId);
  if (!currentGame) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { message: "Game not found" },
      })
    );
    return;
  }

  const opponentPlayerId =
    currentGame.player1Id === requestingPlayerId
      ? currentGame.player2Id
      : currentGame.player1Id;

  if (!opponentPlayerId) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { message: "No opponent found" },
      })
    );
    return;
  }

  const sent = sendToOpponent(gameId, ws, {
    type: "new_game_request",
    data: { requestingPlayerId, requestingPlayerName },
  });

  if (!sent) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { message: "Opponent not connected" },
      })
    );
  }
}

async function handleNewGameResponse(
  storage: IStorage,
  ws: WebSocket,
  data: { gameId: string; respondingPlayerId: string; accepted: boolean }
) {
  const { gameId, respondingPlayerId, accepted } = data;

  const responseGame = await storage.getGame(gameId);
  if (!responseGame) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { message: "Game not found" },
      })
    );
    return;
  }

  const requesterPlayerId =
    responseGame.player1Id === respondingPlayerId
      ? responseGame.player2Id
      : responseGame.player1Id;

  if (!requesterPlayerId) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { message: "Requester not found" },
      })
    );
    return;
  }

  if (accepted) {
    await createNewMultiplayerGame(
      storage,
      gameId,
      responseGame,
      requesterPlayerId,
      respondingPlayerId
    );
  } else {
    sendToOpponent(gameId, ws, {
      type: "new_game_rejected",
      data: { rejectingPlayerId: respondingPlayerId },
    });
  }
}

async function createNewMultiplayerGame(
  storage: IStorage,
  oldGameId: string,
  oldGame: Game,
  requesterPlayerId: string,
  respondingPlayerId: string
) {
  try {
    // Map user IDs from old game to new game based on player IDs
    // The requester becomes player1, the responder becomes player2
    const requesterIsOldPlayer1 = oldGame.player1Id === requesterPlayerId;
    const newPlayer1UserId = requesterIsOldPlayer1
      ? oldGame.player1UserId
      : oldGame.player2UserId;
    const newPlayer2UserId = requesterIsOldPlayer1
      ? oldGame.player2UserId
      : oldGame.player1UserId;

    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGame = await storage.createGame({
      roomCode: newRoomCode,
      player1UserId: newPlayer1UserId ?? undefined,
      gameMode: oldGame.gameMode as "normal" | "hard",
      targetScore: oldGame.targetScore,
      allowStealing: oldGame.allowStealing,
      categories: oldGame.categories,
      eras: oldGame.eras,
    });

    const currentEvent = await storage.getRandomHistoricalEvent(
      newGame.placedEventIds,
      newGame.categories,
      newGame.eras
    );

    const firstTurn = Math.random() < 0.5 ? "player1" : "player2";

    await storage.updateGame(newGame.id, {
      player1Id: requesterPlayerId,
      player2Id: respondingPlayerId,
      player2UserId: newPlayer2UserId,
      currentTurn: firstTurn,
      currentEventId: currentEvent?.id,
      gameStatus: "playing",
    });

    broadcastToGame(oldGameId, {
      type: "new_game_accepted",
      data: { newGameId: newGame.id, roomCode: newGame.roomCode! },
    });
  } catch (error) {
    console.error("Error creating new game:", error);
  }
}
