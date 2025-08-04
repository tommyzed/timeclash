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

  // Create a new game on component mount
  const createGameMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games", {});
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
    }
  }, [gameState, playerId]);

  // WebSocket connection for multiplayer
  const { isConnected, sendMessage } = useWebSocket({
    gameId: isMultiplayer ? gameId || undefined : undefined,
    playerId: isMultiplayer ? playerId || undefined : undefined,
    onMessage: (message: WebSocketMessage) => {
      console.log('Received WebSocket message:', message);
      // Handle real-time updates here
      if (message.type === 'move_made') {
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
    createGameMutation.mutate();
  };

  const handleSelectCard = (cardId: string) => {
    console.log('Game: Card selected:', cardId);
    setSelectedCardId(cardId);
  };

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
      {!isMultiplayer && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-xs font-bold">?</span>
            </div>
            <div>
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
            />
          </div>
          
          <div className="lg:col-span-1">
            <GameStats gameState={gameState} />
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
    </div>
  );
}
