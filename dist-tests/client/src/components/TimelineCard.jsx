export default function TimelineCard(_a) {
    var event = _a.event, isPlaced = _a.isPlaced, _b = _a.isStarting, isStarting = _b === void 0 ? false : _b, _c = _a.isDragging, isDragging = _c === void 0 ? false : _c, onDragStart = _a.onDragStart, onDragEnd = _a.onDragEnd, placedByPlayerName = _a.placedByPlayerName, placedByPlayerId = _a.placedByPlayerId, currentPlayerId = _a.currentPlayerId, playerColor = _a.playerColor;
    var colorMap = {
        blue: "from-blue-500 to-blue-600",
        orange: "from-orange-500 to-orange-600",
        green: "from-green-500 to-green-600",
        pink: "from-pink-500 to-pink-600",
        purple: "from-purple-500 to-purple-600",
        red: "from-red-500 to-red-600",
        yellow: "from-yellow-500 to-yellow-600",
    };
    var getCardColor = function () {
        if (isStarting)
            return "from-green-500 to-green-600";
        if (isPlaced && placedByPlayerId) {
            // In single-player mode, use the selected color or default to blue
            if (placedByPlayerId === "single-player") {
                return playerColor ? colorMap[playerColor] : "from-blue-500 to-blue-600";
            }
            // In multiplayer mode: current player gets their selected color, opponent gets orange
            if (currentPlayerId && placedByPlayerId === currentPlayerId) {
                return playerColor ? colorMap[playerColor] : "from-blue-500 to-blue-600";
            }
            else {
                return "from-orange-500 to-orange-600";
            }
        }
        if (isPlaced)
            return "from-blue-500 to-blue-600";
        return "from-purple-500 to-purple-600";
    };
    var getCardLabel = function () {
        if (isPlaced)
            return "CORRECTLY PLACED";
        return "When Did This Happen?";
    };
    return (<div className={"flex-shrink-0 w-48 ".concat(isDragging ? 'opacity-70 transform rotate-1' : '', " ").concat(!isPlaced ? 'cursor-move card-hover' : '')} draggable={false} style={{ userSelect: 'none' }} data-testid={"timeline-card-".concat(event.id)}>
      <div className={"bg-gradient-to-br ".concat(getCardColor(), " text-white p-4 rounded-lg shadow-md")}>
        {/* Player name section with divider */}
        {isPlaced && placedByPlayerName ? (<>
            <div className="text-xs font-semibold mb-2 px-2 py-1 rounded-sm text-[#ffffff] bg-[#80fff433] text-center">
              {placedByPlayerName.toUpperCase()}
            </div>
            <hr className="border-white border-opacity-30 mb-3"/>
          </>) : !isPlaced ? (<div className="text-xs font-semibold mb-2 bg-transparent px-2 py-1 rounded-sm text-center text-[#1a1c25]">{getCardLabel()}</div>) : null}

        <div className="text-sm font-medium mb-4">{event.title}</div>
        <div className="text-right">
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-bold">
            {isPlaced ? (event.year < 0 ? "".concat(Math.abs(event.year), " B.C.") : event.year) : '????'}
          </span>
        </div>
      </div>
    </div>);
}
