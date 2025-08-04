import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type GameState } from "@shared/schema";
import GameHeader from "@/components/GameHeader";
import Timeline from "@/components/Timeline";
import CurrentCard from "@/components/CurrentCard";
import GameStats from "@/components/GameStats";
import RecentActivity from "@/components/RecentActivity";
import GameControls from "@/components/GameControls";
import FeedbackModal from "@/components/FeedbackModal";

export default function Game() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<{
    isVisible: boolean;
    isCorrect: boolean;
    message: string;
  }>({
    isVisible: false,
    isCorrect: false,
    message: ""
  });

  // Create a new game on component mount
  const createGameMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games");
      return res.json();
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

  // Place event mutation
  const placeEventMutation = useMutation({
    mutationFn: async ({ eventId, position }: { eventId: string; position: number }) => {
      const res = await apiRequest("POST", `/api/games/${gameId}/place/${eventId}`, { position });
      return res.json();
    },
    onSuccess: (result) => {
      setFeedbackData({
        isVisible: true,
        isCorrect: result.isCorrect,
        message: result.message
      });
      
      // Refetch game state
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    }
  });

  useEffect(() => {
    if (!gameId) {
      createGameMutation.mutate();
    }
  }, []);

  const handlePlaceEvent = (eventId: string, position: number) => {
    console.log('handlePlaceEvent called:', { eventId, position });
    placeEventMutation.mutate({ eventId, position });
  };

  const handleCloseFeedback = () => {
    setFeedbackData(prev => ({ ...prev, isVisible: false }));
  };

  const handleNewGame = () => {
    setGameId(null);
    setFeedbackData({ isVisible: false, isCorrect: false, message: "" });
    createGameMutation.mutate();
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
      <GameHeader gameState={gameState} />
      
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mx-4 mt-4 rounded-r-lg">
        <div className="flex items-start">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <span className="text-white text-xs font-bold">?</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">How to Play</h3>
            <p className="text-sm text-blue-700">
              Drag the purple "Current Card" below and drop it into the dashed drop zones in your timeline above. 
              Drop it <strong>"Before"</strong> the first card or <strong>"After"</strong> any existing card to place it chronologically. 
              Get 10 cards correctly placed to win!
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Timeline 
              gameState={gameState} 
              onPlaceEvent={handlePlaceEvent}
              isPlacing={placeEventMutation.isPending}
            />
            <CurrentCard 
              gameState={gameState} 
              onPlaceEvent={handlePlaceEvent}
              isPlacing={placeEventMutation.isPending}
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
