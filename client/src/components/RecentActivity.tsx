import { type GameState } from "@shared/schema";

interface RecentActivityProps {
  gameState: GameState;
}

export default function RecentActivity({ gameState }: RecentActivityProps) {
  const { recentMoves } = gameState;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-testid="recent-activity">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Moves</h3>
      
      <div className="space-y-3">
        {recentMoves.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No moves yet</p>
        ) : (
          recentMoves.map((move) => (
            <div 
              key={move.id}
              className={`flex items-start space-x-3 p-2 rounded-lg ${
                move.isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}
              data-testid={`move-${move.id}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                move.isCorrect ? 'bg-green-600' : 'bg-red-600'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{move.event.title}</p>
                <p className={`text-xs ${
                  move.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {move.isCorrect 
                    ? `Placed correctly (${move.event.year})`
                    : `Incorrect placement (${move.event.year})`
                  }
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
