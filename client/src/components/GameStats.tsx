import { type GameState } from "@shared/schema";

interface GameStatsProps {
  gameState: GameState;
}

export default function GameStats({ gameState }: GameStatsProps) {
  const { game, recentMoves } = gameState;
  
  const correctMoves = recentMoves.filter(move => move.isCorrect).length;
  const incorrectMoves = recentMoves.filter(move => !move.isCorrect).length;
  const progressPercentage = (game.score / game.targetScore) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-testid="game-stats">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Progress</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{game.score}/{game.targetScore}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xl font-bold text-green-600" data-testid="correct-count">
              {game.score}
            </div>
            <div className="text-xs text-green-700">Correct</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xl font-bold text-red-600" data-testid="incorrect-count">
              {incorrectMoves}
            </div>
            <div className="text-xs text-red-700">Incorrect</div>
          </div>
        </div>
      </div>
    </div>
  );
}
