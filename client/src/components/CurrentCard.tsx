import { type GameState } from "@shared/schema";
import TimelineCard from "./TimelineCard";

interface CurrentCardProps {
  gameState: GameState;
  onPlaceEvent: (eventId: string, position: number) => void;
  isPlacing: boolean;
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onDeselectCard: () => void;
}

export default function CurrentCard({ gameState, onPlaceEvent, isPlacing, selectedCardId, onSelectCard, onDeselectCard }: CurrentCardProps) {
  const { currentEvent, game } = gameState;

  if (!currentEvent) {
    if (game.gameStatus === 'completed') {
      return (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6" data-testid="game-completed">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trophy text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Congratulations!</h3>
            <p className="text-gray-600">You've successfully completed your timeline!</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6" data-testid="loading-card">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-64 h-32 bg-gray-200 rounded-xl mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading next card...</p>
        </div>
      </div>
    );
  }

  const handleCardClick = () => {
    console.log('Card clicked, setting as selected item:', currentEvent.id);
    if (selectedCardId === currentEvent.id) {
      onDeselectCard();
    } else {
      onSelectCard(currentEvent.id);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm p-6" data-testid="current-card-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Card</h3>
        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          {isPlacing ? 'Placing...' : 'Your Turn'}
        </div>
      </div>
      
      <div className="flex justify-center">
        <div 
          onClick={handleCardClick}
          className={`cursor-pointer transition-transform hover:scale-105 ${
            selectedCardId === currentEvent.id ? 'ring-4 ring-purple-300' : ''
          }`}
        >
          <TimelineCard
            event={currentEvent}
            isPlaced={false}
            isDragging={selectedCardId === currentEvent.id}
          />
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {selectedCardId === currentEvent.id 
            ? "Card selected! Now click a drop zone in the timeline above" 
            : "Click this card to select it"}
        </p>
      </div>
    </div>
  );
}
