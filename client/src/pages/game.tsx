import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type GameState, type WebSocketMessage } from "@shared/schema";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "@/components/GameHeader";
import Timeline from "@/components/Timeline";
import CurrentCard from "@/components/CurrentCard";
import GameStats from "@/components/GameStats";
import RecentActivity from "@/components/RecentActivity";

import FeedbackModal from "@/components/FeedbackModal";

export default function Game() {
  const [match, params] = useRoute("/game/:gameId?");
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const playerId =
    urlParams.get("playerId") || localStorage.getItem("playerId");
  const nickname = localStorage.getItem("nickname");
  const { toast, dismiss } = useToast();

  const [gameId, setGameId] = useState<string | null>(params?.gameId || null);
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(
    !!params?.gameId && !!playerId,
  );
  const [feedbackData, setFeedbackData] = useState<{
    isVisible: boolean;
    isCorrect: boolean;
    message: string;
  }>({
    isVisible: false,
    isCorrect: false,
    message: "",
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [opponentNickname, setOpponentNickname] = useState<string>("");
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [notifiedPlayerIds, setNotifiedPlayerIds] = useState<Set<string>>(
    new Set(),
  );
  const [showHowToPlay, setShowHowToPlay] = useState(() => {
    // Check localStorage to see if user has dismissed the card before
    return localStorage.getItem("dismissedHowToPlay") !== "true";
  });
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);
  const [justWon, setJustWon] = useState(false);
  const [newGameRequest, setNewGameRequest] = useState<{
    isVisible: boolean;
    requestingPlayerId: string;
    requestingPlayerName: string;
  }>({
    isVisible: false,
    requestingPlayerId: "",
    requestingPlayerName: "",
  });

  // Create a new game on component mount
  const createGameMutation = useMutation({
    mutationFn: async (settings: { gameMode?: "normal" | "hard", targetScore?: number }) => {
      // Explicitly specify singlePlayer flag based on current context
      const isSinglePlayerGame = !playerId; // If no playerId, it's single player
      const response = await apiRequest("POST", "/api/games", {
        singlePlayer: isSinglePlayerGame,
        ...settings,
      });
      return await response.json();
    },
    onSuccess: async (game) => {
      const isSinglePlayerGame = !playerId;
      if (isSinglePlayerGame) {
        setGameId(game.id);
        return;
      }

      // Multiplayer: join the newly created game as a new player (like lobby flow)
      try {
        const joinResponse = await apiRequest("POST", "/api/games/join", {
          roomCode: game.roomCode,
          nickname: (nickname || "Player").toString(),
        });
        const joinResult = await joinResponse.json();

        // Persist new player identity and game id
        localStorage.setItem("playerId", joinResult.playerId);
        if (nickname) {
          localStorage.setItem("nickname", nickname);
        }
        localStorage.setItem("gameId", joinResult.game.id);

        // Navigate to new game URL so the Game ID in the route updates
        navigate(`/game/${joinResult.game.id}?playerId=${joinResult.playerId}`);
        setGameId(joinResult.game.id);
      } catch (error) {
        // Fallback: if join fails, at least show the created game
        setGameId(game.id);
      }
    },
  });

  // Get game state
  const { data: gameState, isLoading } = useQuery({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId,
  }) as { data: GameState | undefined; isLoading: boolean };

  // Update multiplayer status when game state loads
  useEffect(() => {
    if (gameState?.game) {
      const hasRoomCode = !!gameState.game.roomCode;
      const hasPlayerId = !!playerId;
      setIsMultiplayer(hasRoomCode && hasPlayerId);

      // Fetch opponent nickname for multiplayer games
      if (hasRoomCode && hasPlayerId) {
        const opponentId =
          playerId === gameState.game.player1Id
            ? gameState.game.player2Id
            : gameState.game.player1Id;

        if (opponentId) {
          fetch(`/api/players/${opponentId}`)
            .then((response) => response.json())
            .then((player) => {
              setOpponentNickname(player.nickname || "Opponent");
            })
            .catch(() => {
              setOpponentNickname("Opponent");
            });
        } else {
          // If no opponent yet, clear the nickname
          setOpponentNickname("");
        }

        // Fetch current player's color
        if (playerId) {
          fetch(`/api/players/${playerId}`)
            .then((response) => response.json())
            .then((player) => {
              if (player.color) {
                setPlayerColor(player.color);
              }
            });
        }
      } else {
        // Clear opponent nickname for single player games
        setOpponentNickname("");
        // For single player, get color from local storage or use default
        setPlayerColor(localStorage.getItem("playerColor") || "blue");
      }
    }
  }, [gameState, playerId]);

  // WebSocket connection for multiplayer
  const { isConnected, sendMessage } = useWebSocket({
    gameId: isMultiplayer ? gameId || undefined : undefined,
    playerId: isMultiplayer ? playerId || undefined : undefined,
    onMessage: (message: WebSocketMessage) => {
      console.log("Received WebSocket message:", message);

      // Handle player joined notification
      if (
        message.type === "player_joined" &&
        message.data.playerId !== playerId
      ) {
        // Refresh game state when a player joins
        queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });

        // Only show notification if we haven't already notified about this player
        if (!notifiedPlayerIds.has(message.data.playerId)) {
          // Mark this player as notified
          setNotifiedPlayerIds((prev) =>
            new Set(prev).add(message.data.playerId),
          );

          // Fetch the player's nickname from the server
          fetch(`/api/players/${message.data.playerId}`)
            .then((response) => response.json())
            .then((player) => {
              const playerName = player.nickname || "A friend";
              setOpponentNickname(playerName); // Also update the header
              toast({
                title: "Player Joined!",
                description: `${playerName} has joined the game.`,
                variant: "success",
                emoji: "👋",
              });
            })
            .catch(() => {
              const fallbackName = "A friend";
              setOpponentNickname(fallbackName); // Also update the header
              toast({
                title: "Player Joined!",
                description: `${fallbackName} has joined the game.`,
                variant: "success",
                emoji: "👋",
              });
            });
        } else {
          // Player already notified, just update opponent nickname silently
          fetch(`/api/players/${message.data.playerId}`)
            .then((response) => response.json())
            .then((player) => {
              const playerName = player.nickname || "A friend";
              setOpponentNickname(playerName);
            })
            .catch(() => {
              setOpponentNickname("A friend");
            });
        }
      }

      // Handle game completion
      if (message.type === "game_completed") {
        setShowVictoryModal(true);

        // Trigger confetti for any game completion (winner or loser)
        setTimeout(() => {
          const duration = 3000;
          const end = Date.now() + duration;

          (function frame() {
            // Create confetti
            if (typeof window !== "undefined" && (window as any).confetti) {
              (window as any).confetti({
                particleCount: Math.floor(Math.random() * 50) + 50,
                angle: Math.random() * 360,
                spread: Math.random() * 50 + 50,
                origin: {
                  x: Math.random(),
                  y: Math.random() - 0.2,
                },
              });
            }

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          })();
        }, 500);

        // Refresh game state to show final scores
        queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      }

      // Handle real-time updates here
      if (message.type === "move_made") {
        // Show toast for opponent's move
        if (message.data.playerId !== playerId) {
          // Get opponent's nickname and event details to show in toast
          console.log("Fetching data for toast:", {
            playerId: message.data.playerId,
            eventId: message.data.eventId,
          });

          Promise.all([
            fetch(`/api/players/${message.data.playerId}`).then((r) => {
              console.log("Player response status:", r.status);
              return r.json();
            }),
            fetch(`/api/events/${message.data.eventId}`).then((r) => {
              console.log("Event response status:", r.status);
              return r.json();
            }),
          ])
            .then(([player, event]) => {
              console.log("Fetched data:", { player, event });
              const opponentName = player.nickname || "Opponent";
              const eventTitle = event.title || "Unknown Event";
              const eventYear = event.year || "Unknown Year";

              // Format year for display (B.C. for negative years)
              const displayYear =
                typeof eventYear === "number" && eventYear < 0
                  ? `${Math.abs(eventYear)} B.C.`
                  : eventYear;

              const status = message.data.isCorrect
                ? "is correct"
                : "is incorrect";
              const toastTitle = `${opponentName} ${status}!`;
              const toastDescription = message.data.isCorrect
                ? `${eventTitle} happened in year ${displayYear}.`
                : `${eventTitle} was placed incorrectly.`;

              toast({
                title: toastTitle,
                description: toastDescription,
                variant: message.data.isCorrect ? "success" : "destructive",
                emoji: message.data.isCorrect ? "✅" : "❌",
              });
            })
            .catch((error) => {
              console.error("Error fetching toast data:", error);
              // Fallback toast if API calls fail
              const status = message.data.isCorrect
                ? "is correct"
                : "is incorrect";
              toast({
                title: `Opponent ${status}!`,
                description: `Your opponent just made a move.`,
                variant: message.data.isCorrect ? "success" : "destructive",
                emoji: message.data.isCorrect ? "✅" : "❌",
              });
            });
        }

        // Refresh game state when opponent makes a move
        queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      }

      // Handle new game request
      if (message.type === "new_game_request") {
        setNewGameRequest({
          isVisible: true,
          requestingPlayerId: message.data.requestingPlayerId,
          requestingPlayerName: message.data.requestingPlayerName,
        });
      }

      // Handle new game accepted
      if (message.type === "new_game_accepted") {
        // Navigate to the new game
        navigate(`/game/${message.data.newGameId}?playerId=${playerId}`);
        setGameId(message.data.newGameId);
        
        toast({
          title: "New Game Started!",
          description: "Both players have accepted the new game.",
          variant: "success",
          emoji: "🎉",
        });
      }

      // Handle new game rejected
      if (message.type === "new_game_rejected") {
        toast({
          title: "New Game Rejected",
          description: "Your opponent declined to start a new game.",
          variant: "destructive",
          emoji: "😢",
        });
      }

      if (message.type === "settings_changed") {
        queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
        toast({
          title: "Game settings updated",
          description: "A Player has changed the game settings.",
         variant: "warning",
         emoji: "⚙️",
        });
      }
    },
  });

  // Place event mutation
  const placeEventMutation = useMutation({
    mutationFn: async ({
      eventId,
      position,
    }: {
      eventId: string;
      position: number;
    }) => {
      const body = isMultiplayer ? { position, playerId } : { position };
      const response = await apiRequest(
        "POST",
        `/api/games/${gameId}/place/${eventId}`,
        body,
      );
      return await response.json();
    },
    onSuccess: (result) => {
      setFeedbackData({
        isVisible: true,
        isCorrect: result.isCorrect,
        message: result.message,
      });

      // Note: WebSocket message is now sent by the server automatically

      // Refetch game state
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });

      // Check for victory after correct placement
      if (result.isCorrect) {
        setJustWon(true);
      }
    },
  });

  useEffect(() => {
    // Only create a single-player game if we don't have a gameId from URL
    if (!gameId && !isMultiplayer) {
      const gameMode = localStorage.getItem("gameMode") as "normal" | "hard" | null;
      const targetScore = Number(localStorage.getItem("targetScore")) || 10;
      createGameMutation.mutate({ gameMode: gameMode || "normal", targetScore });
    }
  }, []);

  const handlePlaceEvent = (eventId: string, position: number) => {
    console.log("handlePlaceEvent called:", { eventId, position });

    // For multiplayer: check if it's the player's turn
    if (isMultiplayer && gameState?.game) {
      const isPlayer1 = playerId === gameState.game.player1Id;
      const isPlayer2 = playerId === gameState.game.player2Id;
      const expectedTurn = isPlayer1 ? "player1" : "player2";

      if (gameState.game.currentTurn !== expectedTurn) {
        setFeedbackData({
          isVisible: true,
          isCorrect: false,
          message:
            "It's not your turn! Wait for the other player to make their move.",
        });
        return;
      }
    }

    placeEventMutation.mutate({ eventId, position });
    setSelectedCardId(null); // Clear selection after placing
  };

  const handleCloseFeedback = () => {
    setFeedbackData((prev) => ({ ...prev, isVisible: false }));
  };

  const handleAcceptNewGame = () => {
    if (gameId && playerId) {
      const message = {
        type: "new_game_response",
        data: {
          gameId,
          respondingPlayerId: playerId,
          accepted: true,
        },
      };
      sendMessage(message);
    }
    setNewGameRequest({ isVisible: false, requestingPlayerId: "", requestingPlayerName: "" });
  };

  const handleRejectNewGame = () => {
    if (gameId && playerId) {
      sendMessage({
        type: "new_game_response",
        data: {
          gameId,
          respondingPlayerId: playerId,
          accepted: false,
        },
      });
    }
    setNewGameRequest({ isVisible: false, requestingPlayerId: "", requestingPlayerName: "" });
  };

  const handleNewGame = () => {
    dismiss();
    setShowVictoryModal(false);
    setShowLossModal(false);

    if (isMultiplayer && gameId && playerId && nickname) {
      // Send new game request to opponent via WebSocket
      sendMessage({
        type: "new_game_request",
        data: {
          gameId,
          requestingPlayerId: playerId,
          requestingPlayerName: nickname,
        },
      });
      
      toast({
        title: "New Game Request Sent",
        description: "Waiting for your opponent to accept...",
        variant: "default",
        emoji: "❓",
      });
    } else {
      // Single player or no multiplayer context - create new game immediately
      setGameId(null);
      setSelectedCardId(null);
      setFeedbackData({ isVisible: false, isCorrect: false, message: "" });
      setJustWon(false);
      const gameMode = localStorage.getItem("gameMode") as "normal" | "hard" | null;
      const targetScore = Number(localStorage.getItem("targetScore")) || 10;
      createGameMutation.mutate({ gameMode: gameMode || "normal", targetScore });
    }
  };

  const handleSelectCard = (cardId: string) => {
    console.log("Game: Card selected:", cardId);
    setSelectedCardId(cardId);
  };

  const handleSettingsChange = async (settings: {
    targetScore: number;
    gameMode: "normal" | "hard";
    allowStealing: boolean;
  }) => {
    if (gameId) {
      try {
        await apiRequest("PATCH", `/api/games/${gameId}/settings`, settings);
        queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      } catch (error) {
        console.error("Failed to update settings:", error);
      }
    }
  };

  // Check for game completion and show victory modal
  useEffect(() => {
    if (gameState?.game && gameState.game.gameStatus === "completed") {
      if (gameState.game.winnerPlayerId === "computer") {
        setShowLossModal(true);
      } else if (!isMultiplayer && justWon) {
        // For single-player games, check if we just won
        setShowVictoryModal(true);
        setJustWon(false);

        // Trigger confetti for single-player wins
        setTimeout(() => {
          const duration = 3000;
          const end = Date.now() + duration;

          (function frame() {
            // Create confetti
            if (typeof window !== "undefined" && (window as any).confetti) {
              (window as any).confetti({
                particleCount: Math.floor(Math.random() * 50) + 50,
                angle: Math.random() * 360,
                spread: Math.random() * 50 + 50,
                origin: {
                  x: Math.random(),
                  y: Math.random() - 0.2,
                },
              });
            }

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          })();
        }, 500);
      }
      // For multiplayer games, the confetti is handled by WebSocket 'game_completed' message
    }
  }, [gameState?.game, justWon, isMultiplayer]);

  const handleDeselectCard = () => {
    console.log("Game: Card deselected");
    setSelectedCardId(null);
  };

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="game-container">
      <GameHeader
        gameState={gameState}
        isMultiplayer={isMultiplayer}
        currentPlayerId={playerId || undefined}
        nickname={nickname || undefined}
        opponentNickname={opponentNickname || undefined}
        onSettingsChange={handleSettingsChange}
        onNewGame={handleNewGame}
        playerColor={playerColor}
        setPlayerColor={setPlayerColor}
      />

      {/* Turn indicator for multiplayer */}
      {isMultiplayer && gameState.game && (
        <div
          className={`border-l-4 p-4 mx-4 mt-4 rounded-r-lg ${(() => {
            const isPlayer1 = playerId === gameState.game.player1Id;
            const isMyTurn =
              (isPlayer1 && gameState.game.currentTurn === "player1") ||
              (!isPlayer1 && gameState.game.currentTurn === "player2");
            return isMyTurn
              ? "bg-green-50 border-green-600"
              : "bg-orange-50 border-orange-600";
          })()}`}
        >
          <div className="flex items-start">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${(() => {
                const isPlayer1 = playerId === gameState.game.player1Id;
                const isMyTurn =
                  (isPlayer1 && gameState.game.currentTurn === "player1") ||
                  (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn ? "bg-green-600" : "bg-orange-600";
              })()}`}
            >
              <span className="text-white text-xs font-bold">
                {(() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn =
                    (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                  return isMyTurn ? "▶" : "⏸";
                })()}
              </span>
            </div>
            <div>
              <h3
                className={`text-sm font-medium ${(() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn =
                    (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                  return isMyTurn ? "text-green-800" : "text-orange-800";
                })()}`}
              >
                {(() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn =
                    (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");

                  if (gameState.game.stealingPlayerId) {
                    return gameState.game.stealingPlayerId === playerId
                      ? "Steal Attempt!"
                      : "Opponent Stealing!";
                  }

                  return isMyTurn ? "Your Turn!" : "Opponent's Turn";
                })()}
              </h3>
              <p
                className={`text-sm ${(() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn =
                    (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                  return isMyTurn ? "text-green-700" : "text-orange-700";
                })()}`}
              >
                {(() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn =
                    (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");

                  if (gameState.game.stealingPlayerId) {
                    return gameState.game.stealingPlayerId === playerId
                      ? "Your opponent made a mistake! Place the card correctly to steal it."
                      : "You made a mistake! Your opponent is now attempting to steal the card.";
                  }

                  return isMyTurn
                    ? "Click the current card to select it, then click a drop zone to place it chronologically."
                    : "Please wait for the other player to make their move.";
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for single player */}
      {!isMultiplayer && showHowToPlay && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mx-4 mt-4 rounded-r-lg relative">
          <button
            onClick={() => {
              setShowHowToPlay(false);
              localStorage.setItem("dismissedHowToPlay", "true");
            }}
            className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 transition-colors"
            data-testid="close-how-to-play"
            aria-label="Close instructions"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-xs font-bold">?</span>
            </div>
            <div className="pr-8">
              <h3 className="text-sm font-medium text-blue-800">How to Play</h3>
              <p className="text-sm text-blue-700">
                <strong>Step 1:</strong> Click the purple "Current Card" below
                to select it.
                <strong>Step 2:</strong> Click a drop zone in your timeline
                above to place it chronologically. Choose{" "}
                <strong>"Before"</strong> the first card or{" "}
                <strong>"After"</strong> any existing card. Get 10 cards
                correctly placed to win!
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Timeline
              gameState={gameState}
              onPlaceEvent={handlePlaceEvent}
              isPlacing={placeEventMutation.isPending}
              selectedCardId={selectedCardId}
              currentPlayerId={playerId || undefined}
              playerColor={playerColor}
            />
            <CurrentCard
              gameState={gameState}
              onPlaceEvent={handlePlaceEvent}
              isPlacing={placeEventMutation.isPending}
              selectedCardId={selectedCardId}
              onSelectCard={handleSelectCard}
              onDeselectCard={handleDeselectCard}
              isMultiplayer={isMultiplayer}
              currentPlayerId={playerId || undefined}
            />
          </div>

          <div className="lg:col-span-1">
            <GameStats
              gameState={gameState}
              currentPlayerId={playerId || undefined}
            />
            <RecentActivity gameState={gameState} />
          </div>
        </div>
      </main>

      <FeedbackModal
        isVisible={feedbackData.isVisible}
        isCorrect={feedbackData.isCorrect}
        message={feedbackData.message}
        onClose={handleCloseFeedback}
      />

      {/* Victory Modal */}
      {showVictoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2L3 7v11h14V7l-7-5zM8 15.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                    clipRule="evenodd"
                  />
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              {isMultiplayer && gameState?.game ? (
                <>
                  {gameState.game.winnerPlayerId === playerId ? (
                    <>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        🎉 You Won! 🎉
                      </h2>
                      <p className="text-lg text-gray-600 mb-2">
                        Congratulations! You completed your timeline first!
                      </p>
                      <p className="text-sm text-gray-500">
                        Final Score: You{" "}
                        {gameState.game.player1Id === playerId
                          ? gameState.game.player1Score
                          : gameState.game.player2Score}{" "}
                        -{" "}
                        {gameState.game.player1Id === playerId
                          ? gameState.game.player2Score
                          : gameState.game.player1Score}{" "}
                        {opponentNickname || "Opponent"}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        🎊 Game Complete! 🎊
                      </h2>
                      <p className="text-lg text-gray-600 mb-2">
                        {opponentNickname || "Your opponent"} won this round!
                      </p>
                      <p className="text-sm text-gray-500">
                        Final Score: {opponentNickname || "Opponent"}{" "}
                        {gameState.game.player1Id === playerId
                          ? gameState.game.player2Score
                          : gameState.game.player1Score}{" "}
                        -{" "}
                        {gameState.game.player1Id === playerId
                          ? gameState.game.player1Score
                          : gameState.game.player2Score}{" "}
                        You
                      </p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    🎉 Congratulations! 🎉
                  </h2>
                  <p className="text-lg text-gray-600 mb-2">
                    You've completed your historical timeline!
                  </p>
                  <p className="text-sm text-gray-500">
                    You successfully placed {gameState?.game?.targetScore || 10}{" "}
                    events in chronological order!
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleNewGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                data-testid="play-again-button"
              >
                🔄 Play Again
              </button>
              <button
                onClick={() => setShowVictoryModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                data-testid="close-victory-modal"
              >
                ⏳️ Review Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loss Modal */}
      {showLossModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Game Over
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                You ran out of attempts!
              </p>
              <p className="text-sm text-gray-500">
                Better luck next time!
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleNewGame}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                data-testid="play-again-button-loss"
              >
                🔄 Play Again
              </button>
              <button
                onClick={() => setShowLossModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                ⏳️ Review Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Game Request Modal */}
      {newGameRequest.isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                New Game Request
              </h2>
              <p className="text-gray-600">
                <span className="font-medium">{newGameRequest.requestingPlayerName}</span>{" "}
                wants to start a new game. Would you like to join?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAcceptNewGame}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                data-testid="accept-new-game-button"
              >
                Accept
              </button>
              <button
                onClick={handleRejectNewGame}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                data-testid="reject-new-game-button"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
