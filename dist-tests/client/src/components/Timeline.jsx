import { ArrowRightFromLine } from "lucide-react";
import TimelineCard from "./TimelineCard";
export default function Timeline(_a) {
    var gameState = _a.gameState, onPlaceEvent = _a.onPlaceEvent, isPlacing = _a.isPlacing, selectedCardId = _a.selectedCardId, currentPlayerId = _a.currentPlayerId, playerColor = _a.playerColor;
    var placedEvents = gameState.placedEvents, currentEvent = gameState.currentEvent;
    return (<div className="bg-white rounded-xl shadow-sm p-6" data-testid="timeline-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Your Timeline</h2>
        <div className="text-sm text-gray-500">
          <ArrowRightFromLine className="inline-block mr-1 h-4 w-4"/>
          Scroll horizontally to see more
        </div>
      </div>

      <div className="relative overflow-x-auto pb-4">
        <div className="flex items-center min-w-max">
          {/* Drop zone before the first card */}
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            <div className={"timeline-slot w-8 h-24 rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer ".concat(selectedCardId
            ? "border-purple-400 bg-purple-50 hover:border-purple-600 hover:bg-purple-100"
            : "border-gray-300")} data-position={0} data-testid="drop-zone-0" onClick={function (e) {
            console.log("Drop zone 0 clicked! selectedCardId:", selectedCardId);
            e.stopPropagation();
            if (selectedCardId) {
                console.log("Placing event:", {
                    selectedCardId: selectedCardId,
                    position: 0,
                });
                onPlaceEvent(selectedCardId, 0);
            }
            else {
                console.log("No card selected - click the card first");
            }
        }}>
              <div className="text-center text-xs text-gray-400 rotate-90 whitespace-nowrap pointer-events-none">
                {selectedCardId ? "Drop Here" : "Between"}
              </div>
            </div>
          </div>

          {placedEvents.map(function (placedEvent, index) { return (<div key={"".concat(placedEvent.event.id, "-").concat(index)} className="flex items-center">
              <TimelineCard event={placedEvent.event} isPlaced={true} isStarting={!placedEvent.placedByPlayerId} placedByPlayerName={placedEvent.placedByPlayerName} placedByPlayerId={placedEvent.placedByPlayerId} currentPlayerId={currentPlayerId} playerColor={playerColor}/>

              {/* Drop zone after each card */}
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <div className={"timeline-slot w-8 h-24 rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer ".concat(selectedCardId
                ? "border-purple-400 bg-purple-50 hover:border-purple-600 hover:bg-purple-100"
                : "border-gray-300")} data-position={index + 1} data-testid={"drop-zone-".concat(index + 1)} onClick={function (e) {
                console.log("Drop zone ".concat(index + 1, " clicked! selectedCardId:"), selectedCardId);
                e.stopPropagation();
                if (selectedCardId) {
                    console.log("Placing event:", {
                        selectedCardId: selectedCardId,
                        position: index + 1,
                    });
                    onPlaceEvent(selectedCardId, index + 1);
                }
                else {
                    console.log("No card selected - click the card first");
                }
            }}>
                  <div className="text-center text-xs text-gray-400 rotate-90 whitespace-nowrap pointer-events-none">
                    {selectedCardId ? "Drop Here" : "Between"}
                  </div>
                </div>
              </div>
            </div>); })}
        </div>
      </div>
    </div>);
}
