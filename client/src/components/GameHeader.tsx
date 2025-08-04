import { Clock, Settings } from "lucide-react";
import { type GameState } from "@shared/schema";

interface GameHeaderProps {
  gameState: GameState;
  isMultiplayer?: boolean;
  currentPlayerId?: string;
  nickname?: string;
}

export default function GameHeader({ gameState, isMultiplayer, currentPlayerId, nickname }: GameHeaderProps) {
  const { game } = gameState;
  
  const getGameModeDisplay = () => {
    if (isMultiplayer && game.roomCode) {
      return (
        <div className="flex items-center space-x-2">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Multiplayer
          </span>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            Room: {game.roomCode}
          </span>
        </div>
      );
    }
    return (
      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
        Single Player
      </span>
    );
  };

  const getScoreDisplay = () => {
    if (isMultiplayer) {
      const currentPlayerScore = currentPlayerId === game.player1Id ? game.player1Score : game.player2Score;
      const opponentScore = currentPlayerId === game.player1Id ? game.player2Score : game.player1Score;
      
      return (
        <div className="flex items-center space-x-4">
          <div className="text-center" data-testid="score-display">
            <div className="text-lg font-bold text-blue-600">{currentPlayerScore}</div>
            <div className="text-xs text-gray-500">YOUR SCORE</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{opponentScore}</div>
            <div className="text-xs text-gray-500">OPPONENT</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">{game.targetScore}</div>
            <div className="text-xs text-gray-500">TARGET</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-6">
        <div className="text-center" data-testid="score-display">
          <div className="text-2xl font-bold text-blue-600">{game.player1Score || 0}</div>
          <div className="text-xs text-gray-500">CARDS PLACED</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400">{game.targetScore}</div>
          <div className="text-xs text-gray-500">TARGET</div>
        </div>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b" data-testid="game-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              <Clock className="inline-block text-blue-600 mr-2 h-7 w-7" />
              Chronology
            </h1>
            {getGameModeDisplay()}
            {nickname && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                {nickname}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {getScoreDisplay()}
            <button 
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
              data-testid="settings-button"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
