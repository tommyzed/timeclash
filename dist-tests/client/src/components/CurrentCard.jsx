import TimelineCard from "./TimelineCard";
export default function CurrentCard(_a) {
    var gameState = _a.gameState, onPlaceEvent = _a.onPlaceEvent, isPlacing = _a.isPlacing, selectedCardId = _a.selectedCardId, onSelectCard = _a.onSelectCard, onDeselectCard = _a.onDeselectCard, isMultiplayer = _a.isMultiplayer, currentPlayerId = _a.currentPlayerId;
    var currentEvent = gameState.currentEvent, game = gameState.game;
    // Determine if it's the current player's turn in multiplayer
    var isMyTurn = !isMultiplayer || (function () {
        var isPlayer1 = currentPlayerId === game.player1Id;
        return (isPlayer1 && game.currentTurn === "player1") ||
            (!isPlayer1 && game.currentTurn === "player2");
    })();
    if (!currentEvent) {
        if (game.gameStatus === 'completed') {
            return (<div className="mt-6 bg-white rounded-xl shadow-sm p-6" data-testid="game-completed">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trophy text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Congratulations!</h3>
            <p className="text-gray-600">You've successfully completed your timeline!</p>
          </div>
        </div>);
        }
        return (<div className="mt-6 bg-white rounded-xl shadow-sm p-6" data-testid="loading-card">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-64 h-32 bg-gray-200 rounded-xl mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading next card...</p>
        </div>
      </div>);
    }
    var handleCardClick = function () {
        console.log('Card clicked, setting as selected item:', currentEvent.id);
        if (selectedCardId === currentEvent.id) {
            onDeselectCard();
        }
        else {
            onSelectCard(currentEvent.id);
        }
    };
    return (<div className="mt-6 bg-white rounded-xl shadow-sm p-6" data-testid="current-card-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Card</h3>
        <div className={"px-3 py-1 rounded-full text-sm font-medium ".concat(isPlacing
            ? 'bg-blue-100 text-blue-800'
            : isMyTurn
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800')}>
          {isPlacing
            ? 'Placing...'
            : isMyTurn
                ? 'Your Turn'
                : "Opponent's Turn"}
        </div>
      </div>

      <div className="flex justify-center">
        <div onClick={isMyTurn ? handleCardClick : undefined} className={"transition-transform ".concat(isMyTurn
            ? 'cursor-pointer hover:scale-105'
            : 'cursor-not-allowed opacity-50', " ").concat(selectedCardId === currentEvent.id ? 'ring-4 ring-purple-300' : '')}>
          <TimelineCard event={currentEvent} isPlaced={false} isDragging={selectedCardId === currentEvent.id}/>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {!isMyTurn
            ? "Wait for the other player to make their move"
            : selectedCardId === currentEvent.id
                ? "Card selected! Now click a drop zone in the timeline above"
                : "Click this card to select it"}
        </p>
      </div>
    </div>);
}
