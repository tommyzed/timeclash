import { Clock, Settings } from "lucide-react";
import { type GameState } from "@shared/schema";

interface GameHeaderProps {
  gameState: GameState;
}

export default function GameHeader({ gameState }: GameHeaderProps) {
  const { game } = gameState;

  return (
    <header className="bg-white shadow-sm border-b" data-testid="game-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              <Clock className="inline-block text-blue-600 mr-2 h-7 w-7" />
              Chronology
            </h1>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Single Player
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center" data-testid="score-display">
              <div className="text-2xl font-bold text-blue-600">{game.score}</div>
              <div className="text-xs text-gray-500">CARDS PLACED</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{game.targetScore}</div>
              <div className="text-xs text-gray-500">TARGET</div>
            </div>
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
