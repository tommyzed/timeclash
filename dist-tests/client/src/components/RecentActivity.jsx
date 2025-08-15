export default function RecentActivity(_a) {
    var gameState = _a.gameState;
    var recentMoves = gameState.recentMoves;
    return (<div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-testid="recent-activity">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Moves</h3>

      <div className="space-y-3">
        {recentMoves.length === 0 ? (<p className="text-sm text-gray-500 text-center py-4">No moves yet</p>) : (recentMoves.map(function (move) { return (<div key={move.id} className={"flex items-start space-x-3 p-2 rounded-lg ".concat(move.isCorrect ? "bg-green-50" : "bg-red-50")} data-testid={"move-".concat(move.id)}>
              <div className={"w-2 h-2 rounded-full mt-2 ".concat(move.isCorrect ? "bg-green-600" : "bg-red-600")}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {move.event.title}
                  </p>
                </div>
                <p className={"text-xs ".concat(move.isCorrect ? "text-green-700" : "text-red-700")}>
                  {(function () {
                var displayYear = move.event.year < 0
                    ? "".concat(Math.abs(move.event.year), " B.C.")
                    : move.event.year;
                var resultText = move.isCorrect
                    ? "Placed correctly! (".concat(displayYear, ")")
                    : "Placed incorrectly (".concat(displayYear, ")");
                return move.playerName ? (<>
                        <span className="font-bold text-blue-600">
                          {move.playerName}:
                        </span>
                        {" " + resultText}
                      </>) : (resultText);
            })()}
                </p>
              </div>
            </div>); }))}
      </div>
    </div>);
}
