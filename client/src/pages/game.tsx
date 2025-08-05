import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type GameState, type WebSocketMessage } from "@shared/schema";
import { useWebSocket } from "@/hooks/useWebSocket";
import GameHeader from "@/components/GameHeader";
import Timeline from "@/components/Timeline";
import CurrentCard from "@/components/CurrentCard";
import GameStats from "@/components/GameStats";
import RecentActivity from "@/components/RecentActivity";
import GameControls from "@/components/GameControls";
import FeedbackModal from "@/components/FeedbackModal";

export default function Game() {
  const [match, params] = useRoute("/game/:gameId?");
  const urlParams = new URLSearchParams(window.location.search);
  const playerId = urlParams.get('playerId') || localStorage.getItem('playerId');
  const nickname = localStorage.getItem('nickname');
  
  const [gameId, setGameId] = useState<string | null>(params?.gameId || null);
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(!!params?.gameId && !!playerId);
  const [feedbackData, setFeedbackData] = useState<{
    isVisible: boolean;
    isCorrect: boolean;
    message: string;
  }>({
    isVisible: false,
    isCorrect: false,
    message: ""
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showPlayerJoinedNotification, setShowPlayerJoinedNotification] = useState(false);
  const [joinedPlayerName, setJoinedPlayerName] = useState<string>("");
  const [opponentNickname, setOpponentNickname] = useState<string>("");
  const [showHowToPlay, setShowHowToPlay] = useState(() => {
    // Check localStorage to see if user has dismissed the card before
    return localStorage.getItem('dismissedHowToPlay') !== 'true';
  });
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [justWon, setJustWon] = useState(false);

  // Create a new game on component mount
  const createGameMutation = useMutation({
    mutationFn: async () => {
      // Explicitly specify singlePlayer flag based on current context
      const isSinglePlayerGame = !playerId; // If no playerId, it's single player
      const response = await apiRequest("POST", "/api/games", { 
        singlePlayer: isSinglePlayerGame 
      });
      return await response.json();
    },
    onSuccess: (game) => {
      setGameId(game.id);
    }
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
        const opponentId = playerId === gameState.game.player1Id 
          ? gameState.game.player2Id 
          : gameState.game.player1Id;
        
        if (opponentId) {
          fetch(`/api/players/${opponentId}`)
            .then(response => response.json())
            .then(player => {
              setOpponentNickname(player.nickname || "Opponent");
            })
            .catch(() => {
              setOpponentNickname("Opponent");
            });
        } else {
          // If no opponent yet, clear the nickname
          setOpponentNickname("");
        }
      } else {
        // Clear opponent nickname for single player games
        setOpponentNickname("");
      }
    }
  }, [gameState, playerId]);

  // WebSocket connection for multiplayer
  const { isConnected, sendMessage } = useWebSocket({
    gameId: isMultiplayer ? gameId || undefined : undefined,
    playerId: isMultiplayer ? playerId || undefined : undefined,
    onMessage: (message: WebSocketMessage) => {
      console.log('Received WebSocket message:', message);
      
      // Handle player joined notification
      if (message.type === 'player_joined' && message.data.playerId !== playerId) {
        // Fetch the player's nickname from the server
        fetch(`/api/players/${message.data.playerId}`)
          .then(response => response.json())
          .then(player => {
            const playerName = player.nickname || "A friend";
            setJoinedPlayerName(playerName);
            setOpponentNickname(playerName); // Also update the header
            setShowPlayerJoinedNotification(true);
            setTimeout(() => setShowPlayerJoinedNotification(false), 4000);
          })
          .catch(() => {
            const fallbackName = "A friend";
            setJoinedPlayerName(fallbackName);
            setOpponentNickname(fallbackName); // Also update the header
            setShowPlayerJoinedNotification(true);
            setTimeout(() => setShowPlayerJoinedNotification(false), 4000);
          });
      }
      
      // Handle real-time updates here
      if (message.type === 'move_made') {
        // Show toast for opponent's move
        if (message.data.playerId !== playerId) {
          // Get opponent's nickname and event details to show in toast
          Promise.all([
            fetch(`/api/players/${message.data.playerId}`).then(r => r.json()),
            fetch(`/api/events/${message.data.eventId}`).then(r => r.json())
          ])
          .then(([player, event]) => {
            const opponentName = player.nickname || "Opponent";
            const eventTitle = event.title || "Unknown Event";
            const eventYear = event.year || "Unknown Year";
            
            const status = message.data.isCorrect ? "is correct" : "is incorrect";
            const toastTitle = `${opponentName} ${status}!`;
            const toastDescription = message.data.isCorrect 
              ? `${eventTitle} happened in year ${eventYear}.`
              : `${eventTitle} was placed incorrectly.`;
            
            toast({
              title: toastTitle,
              description: toastDescription,
              variant: message.data.isCorrect ? "default" : "destructive",
            });
          })
          .catch(() => {
            // Fallback toast if API calls fail
            const status = message.data.isCorrect ? "is correct" : "is incorrect";
            toast({
              title: `Opponent ${status}!`,
              description: `Your opponent just made a move.`,
              variant: message.data.isCorrect ? "default" : "destructive",
            });
          });
        }
        
        // Refresh game state when opponent makes a move
        queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      }
    }
  });

  // Place event mutation
  const placeEventMutation = useMutation({
    mutationFn: async ({ eventId, position }: { eventId: string; position: number }) => {
      const body = isMultiplayer ? { position, playerId } : { position };
      const response = await apiRequest("POST", `/api/games/${gameId}/place/${eventId}`, body);
      return await response.json();
    },
    onSuccess: (result) => {
      setFeedbackData({
        isVisible: true,
        isCorrect: result.isCorrect,
        message: result.message
      });
      
      // Send WebSocket message for multiplayer
      if (isMultiplayer && isConnected) {
        sendMessage({
          type: 'make_move',
          data: { 
            gameId, 
            playerId, 
            eventId: selectedCardId, 
            position: 0, // Will be updated with actual position
            isCorrect: result.isCorrect
          }
        });
      }
      
      // Refetch game state
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      
      // Check for victory after correct placement
      if (result.isCorrect) {
        setJustWon(true);
      }
    }
  });

  useEffect(() => {
    // Only create a single-player game if we don't have a gameId from URL
    if (!gameId && !isMultiplayer) {
      createGameMutation.mutate();
    }
  }, []);

  const handlePlaceEvent = (eventId: string, position: number) => {
    console.log('handlePlaceEvent called:', { eventId, position });
    
    // For multiplayer: check if it's the player's turn
    if (isMultiplayer && gameState?.game) {
      const isPlayer1 = playerId === gameState.game.player1Id;
      const isPlayer2 = playerId === gameState.game.player2Id;
      const expectedTurn = isPlayer1 ? "player1" : "player2";
      
      if (gameState.game.currentTurn !== expectedTurn) {
        setFeedbackData({
          isVisible: true,
          isCorrect: false,
          message: "It's not your turn! Wait for the other player to make their move."
        });
        return;
      }
    }
    
    placeEventMutation.mutate({ eventId, position });
    setSelectedCardId(null); // Clear selection after placing
  };

  const handleCloseFeedback = () => {
    setFeedbackData(prev => ({ ...prev, isVisible: false }));
  };

  const handleNewGame = () => {
    setGameId(null);
    setSelectedCardId(null);
    setFeedbackData({ isVisible: false, isCorrect: false, message: "" });
    setShowVictoryModal(false);
    setJustWon(false);
    createGameMutation.mutate();
  };

  const handleSelectCard = (cardId: string) => {
    console.log('Game: Card selected:', cardId);
    setSelectedCardId(cardId);
  };

  const handleTargetChange = async (newTarget: number) => {
    if (gameId) {
      try {
        await apiRequest("PATCH", `/api/games/${gameId}/settings`, { targetScore: newTarget });
        queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      } catch (error) {
        console.error('Failed to update target score:', error);
      }
    }
  };

  // Check for game completion and show victory modal
  useEffect(() => {
    if (gameState?.game && justWon) {
      const currentScore = gameState.game.player1Score;
      if (currentScore >= gameState.game.targetScore && gameState.game.gameStatus === 'completed') {
        setShowVictoryModal(true);
        setJustWon(false);
        
        // Trigger confetti
        setTimeout(() => {
          const duration = 3000;
          const end = Date.now() + duration;
          
          (function frame() {
            // Create confetti
            if (typeof window !== 'undefined' && (window as any).confetti) {
              (window as any).confetti({
                particleCount: Math.floor(Math.random() * 50) + 50,
                angle: Math.random() * 360,
                spread: Math.random() * 50 + 50,
                origin: {
                  x: Math.random(),
                  y: Math.random() - 0.2
                }
              });
            }
            
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          }());
        }, 500);
      }
    }
  }, [gameState?.game?.gameStatus, gameState?.game?.player1Score, justWon]);

  const handleDeselectCard = () => {
    console.log('Game: Card deselected');
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
        onTargetChange={handleTargetChange}
      />
      
      {/* Turn indicator for multiplayer */}
      {isMultiplayer && gameState.game && (
        <div className={`border-l-4 p-4 mx-4 mt-4 rounded-r-lg ${
          (() => {
            const isPlayer1 = playerId === gameState.game.player1Id;
            const isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") || 
                           (!isPlayer1 && gameState.game.currentTurn === "player2");
            return isMyTurn 
              ? "bg-green-50 border-green-600" 
              : "bg-orange-50 border-orange-600";
          })()
        }`}>
          <div className="flex items-start">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
              (() => {
                const isPlayer1 = playerId === gameState.game.player1Id;
                const isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") || 
                               (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn 
                  ? "bg-green-600" 
                  : "bg-orange-600";
              })()
            }`}>
              <span className="text-white text-xs font-bold">
                {(() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") || 
                                 (!isPlayer1 && gameState.game.currentTurn === "player2");
                  return isMyTurn ? "▶" : "⏸";
                })()}
              </span>
            </div>
            <div>
              <h3 className={`text-sm font-medium ${
                (() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") || 
                                 (!isPlayer1 && gameState.game.currentTurn === "player2");
                  return isMyTurn ? "text-green-800" : "text-orange-800";
                })()
              }`}>
                {(() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") || 
                                 (!isPlayer1 && gameState.game.currentTurn === "player2");
                  return isMyTurn ? "Your Turn!" : "Opponent's Turn";
                })()}
              </h3>
              <p className={`text-sm ${
                (() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") || 
                                 (!isPlayer1 && gameState.game.currentTurn === "player2");
                  return isMyTurn ? "text-green-700" : "text-orange-700";
                })()
              }`}>
                {(() => {
                  const isPlayer1 = playerId === gameState.game.player1Id;
                  const isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") || 
                                 (!isPlayer1 && gameState.game.currentTurn === "player2");
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
              localStorage.setItem('dismissedHowToPlay', 'true');
            }}
            className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 transition-colors"
            data-testid="close-how-to-play"
            aria-label="Close instructions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-xs font-bold">?</span>
            </div>
            <div className="pr-8">
              <h3 className="text-sm font-medium text-blue-800">How to Play</h3>
              <p className="text-sm text-blue-700">
                <strong>Step 1:</strong> Click the purple "Current Card" below to select it. 
                <strong>Step 2:</strong> Click a drop zone in your timeline above to place it chronologically. 
                Choose <strong>"Before"</strong> the first card or <strong>"After"</strong> any existing card. 
                Get 10 cards correctly placed to win!
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
            <GameStats gameState={gameState} currentPlayerId={playerId || undefined} />
            <RecentActivity gameState={gameState} />
            <GameControls onNewGame={handleNewGame} />
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
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11h14V7l-7-5zM8 15.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Congratulations! 🎉</h2>
              <p className="text-lg text-gray-600 mb-2">You've completed your historical timeline!</p>
              <p className="text-sm text-gray-500">
                You successfully placed {gameState?.game?.targetScore || 10} events in chronological order!
              </p>
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
                Continue Viewing Timeline
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Player Joined Notification */}
      {showPlayerJoinedNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-4 duration-300" data-testid="player-joined-notification">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">👋</span>
            </div>
            <div>
              <p className="font-semibold">Player Joined!</p>
              <p className="text-sm text-green-100">{joinedPlayerName} has joined the game</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
