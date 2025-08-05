import { RotateCcw, HelpCircle, X, Home } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface GameControlsProps {
  onNewGame: () => void;
}

export default function GameControls({ onNewGame }: GameControlsProps) {
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <>
      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">How to Play Chronology</h2>
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  data-testid="close-rules-modal"
                  aria-label="Close rules"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Objective</h3>
                  <p>Build a timeline by placing historical event cards in chronological order. Get 10 cards correctly placed to win!</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Select a Card:</strong> Click the purple "Current Card" below the timeline to select it.</li>
                    <li><strong>Choose Position:</strong> Click a drop zone in your timeline to place the card chronologically.</li>
                    <li><strong>Placement Options:</strong> Choose "Before" the first card or "After" any existing card.</li>
                    <li><strong>Get Feedback:</strong> You'll see if your placement was correct or incorrect.</li>
                    <li><strong>Continue:</strong> Keep placing cards until you have 10 correct placements!</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Scoring</h3>
                  <p>You earn points for each correctly placed card. The game tracks your progress as you build your historical timeline.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multiplayer</h3>
                  <p>In multiplayer mode, take turns with your opponent. Only place cards during your turn, and try to be the first to get 10 correct placements!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    <div className="bg-white rounded-xl shadow-sm p-6" data-testid="game-controls">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Controls</h3>
      
      <div className="space-y-3">
        <button 
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          onClick={onNewGame}
          data-testid="button-new-game"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          New Game
        </button>
        
        <button 
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          onClick={() => setLocation('/')}
          data-testid="button-return-lobby"
        >
          <Home className="mr-2 h-4 w-4" />
          Return to Lobby
        </button>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button 
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => setShowRulesModal(true)}
          data-testid="button-rules"
        >
          <HelpCircle className="inline mr-1 h-4 w-4" />
          View Rules
        </button>
      </div>
    </div>
    </>
  );
}

