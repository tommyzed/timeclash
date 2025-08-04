import { Undo, Lightbulb, RotateCcw, HelpCircle } from "lucide-react";

interface GameControlsProps {
  onNewGame: () => void;
}

export default function GameControls({ onNewGame }: GameControlsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6" data-testid="game-controls">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Controls</h3>
      
      <div className="space-y-3">
        <button 
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          data-testid="button-undo"
          disabled
        >
          <Undo className="mr-2 h-4 w-4" />
          Undo Last Move
        </button>
        
        <button 
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          data-testid="button-hint"
          disabled
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          Hint
        </button>
        
        <button 
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          onClick={onNewGame}
          data-testid="button-new-game"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          New Game
        </button>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button 
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          data-testid="button-rules"
        >
          <HelpCircle className="inline mr-1 h-4 w-4" />
          View Rules
        </button>
      </div>
    </div>
  );
}
