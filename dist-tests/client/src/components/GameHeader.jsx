var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Settings, Copy, Check, X, RotateCcw, Home, HelpCircle, } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import logoImage from "@assets/It's About Time Logo -sm_1754907859214.png";
export default function GameHeader(_a) {
    var _this = this;
    var gameState = _a.gameState, isMultiplayer = _a.isMultiplayer, currentPlayerId = _a.currentPlayerId, nickname = _a.nickname, opponentNickname = _a.opponentNickname, onTargetChange = _a.onTargetChange, onNewGame = _a.onNewGame, playerColor = _a.playerColor, setPlayerColor = _a.setPlayerColor;
    var game = gameState.game;
    var _b = useState(false), copied = _b[0], setCopied = _b[1];
    var _c = useState(false), showSettings = _c[0], setShowSettings = _c[1];
    var _d = useState(false), showRulesModal = _d[0], setShowRulesModal = _d[1];
    var _e = useState(game.targetScore), targetScore = _e[0], setTargetScore = _e[1];
    var _f = useLocation(), setLocation = _f[1];
    var availableColors = [
        "blue",
        "orange",
        "green",
        "pink",
        "purple",
        "red",
        "yellow",
    ];
    var handleColorChange = function (color) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!setPlayerColor) return [3 /*break*/, 6];
                    if (!isMultiplayer) return [3 /*break*/, 5];
                    if (!currentPlayerId) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/players/".concat(currentPlayerId, "/color"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ color: color }),
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        setPlayerColor(color);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to update player color:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    // Single-player mode
                    setPlayerColor(color);
                    localStorage.setItem("playerColor", color);
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyRoomCode = function () { return __awaiter(_this, void 0, void 0, function () {
        var shareableLink, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!game.roomCode) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    shareableLink = "".concat(window.location.origin, "/room/").concat(game.roomCode);
                    return [4 /*yield*/, navigator.clipboard.writeText(shareableLink)];
                case 2:
                    _a.sent();
                    setCopied(true);
                    setTimeout(function () { return setCopied(false); }, 2000);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("Failed to copy shareable link:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getGameModeDisplay = function () {
        if (isMultiplayer && game.roomCode) {
            return (<div className="flex items-center space-x-2">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Multiplayer
          </span>
          <button onClick={handleCopyRoomCode} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors" data-testid="copy-room-code-button" title="Click to copy shareable link">
            <span>Share: {game.roomCode}</span>
            {copied ? (<Check className="h-3 w-3 text-green-600"/>) : (<Copy className="h-3 w-3"/>)}
          </button>
        </div>);
        }
        return (<span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
        Single Player
      </span>);
    };
    var getScoreDisplay = function () {
        if (isMultiplayer) {
            // Determine if current player is player1 or player2
            var isCurrentPlayerPlayer1 = currentPlayerId === game.player1Id;
            // Get scores for both players
            var player1Score = game.player1Score;
            var player2Score = game.player2Score;
            // Get nicknames - use nickname prop for current player, opponentNickname for the other
            var player1Nickname = isCurrentPlayerPlayer1
                ? nickname || "Player 1"
                : opponentNickname || "Player 2";
            var player2Nickname = isCurrentPlayerPlayer1
                ? opponentNickname || "Player 2"
                : nickname || "Player 2";
            return (<div className="flex items-center space-x-4">
          <div className="text-center" data-testid="score-display">
            <div className="text-lg font-bold text-blue-600">
              {player1Score}
            </div>
            <div className="text-xs text-gray-500 uppercase">
              {player1Nickname}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {player2Score}
            </div>
            <div className="text-xs text-gray-500 uppercase">
              {player2Nickname}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">
              {game.targetScore}
            </div>
            <div className="text-xs text-gray-500">TARGET</div>
          </div>
        </div>);
        }
        return (<div className="flex items-center space-x-6">
        <div className="text-center" data-testid="score-display">
          <div className="text-2xl font-bold text-blue-600">
            {game.player1Score || 0}
          </div>
          <div className="text-xs text-gray-500">CARDS PLACED</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400">
            {game.targetScore}
          </div>
          <div className="text-xs text-gray-500">TARGET</div>
        </div>
      </div>);
    };
    return (<header className="bg-white shadow-sm border-b" data-testid="game-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <img src={logoImage} alt="It's About Time!!" className="h-8 w-auto" data-testid="game-header-logo"/>
            {getGameModeDisplay()}
          </div>
          <div className="flex items-center space-x-6">
            {getScoreDisplay()}
            <button onClick={function () { return setShowSettings(true); }} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors" data-testid="settings-button">
              <Settings className="h-5 w-5 text-gray-600"/>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Game Settings</h2>
              <button onClick={function () { return setShowSettings(false); }} className="text-gray-400 hover:text-gray-600 transition-colors" data-testid="close-settings-modal" aria-label="Close settings">
                <X className="w-6 h-6"/>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Score
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Number of cards to place correctly to win the game.
                </p>
                <div className="flex items-center space-x-4">
                  <input type="range" min="5" max="15" value={targetScore} onChange={function (e) { return setTargetScore(Number(e.target.value)); }} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" data-testid="target-score-slider"/>
                  <div className="w-16 text-center">
                    <span className="text-lg font-bold text-blue-600">
                      {targetScore}
                    </span>
                    <div className="text-xs text-gray-500">cards</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5 (Quick)</span>
                  <span>10 (Default)</span>
                  <span>15 (Challenge)</span>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  My Card Color
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Choose the color for the cards you place on the timeline.
                </p>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map(function (color) { return (<button key={color} onClick={function () { return handleColorChange(color); }} className={"w-10 h-10 rounded-full border-2 transition-transform transform hover:scale-110 ".concat(playerColor === color
                    ? "border-blue-600 ring-2 ring-blue-600"
                    : "border-gray-200")} style={{ backgroundColor: color }} data-testid={"color-button-".concat(color)} aria-label={"Select ".concat(color, " color")}/>); })}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button onClick={function () {
                if (onTargetChange) {
                    onTargetChange(targetScore);
                }
                setShowSettings(false);
            }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors" data-testid="save-settings-button">
                  Apply Settings
                </button>
                <button onClick={function () {
                setTargetScore(game.targetScore);
                setShowSettings(false);
            }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors" data-testid="cancel-settings-button">
                  Cancel
                </button>
              </div>

              {/* Game Controls Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3">
                  <button className="w-full bg-gray-100 hover:bg-blue-100 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-start" onClick={function () {
                if (onNewGame) {
                    onNewGame();
                }
                setShowSettings(false);
            }} data-testid="button-new-game">
                    <RotateCcw className="mr-2 h-4 w-4"/>
                    New Game
                  </button>

                  <button className="w-full bg-gray-100 hover:bg-blue-100 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-start" onClick={function () {
                setLocation("/");
                setShowSettings(false);
            }} data-testid="button-return-lobby">
                    <Home className="mr-2 h-4 w-4"/>
                    Return to Lobby
                  </button>

                  <button className="w-full bg-gray-100 hover:bg-blue-100 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-start" onClick={function () {
                setShowRulesModal(true);
                setShowSettings(false);
            }} data-testid="button-rules">
                    <HelpCircle className="mr-1 h-4 w-4"/>
                    View Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>)}

      {/* Rules Modal */}
      {showRulesModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Game Rules
                </h2>
                <button onClick={function () { return setShowRulesModal(false); }} className="text-gray-400 hover:text-gray-600 transition-colors" data-testid="close-rules-modal" aria-label="Close rules">
                  <X className="w-6 h-6"/>
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Objective
                  </h3>
                  <p>
                    Build a timeline by placing historical event cards in
                    chronological order. Get 10 cards correctly placed to win!
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How to Play
                  </h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      <strong>Select a Card:</strong> Click the purple "Current
                      Card" below the timeline to select it.
                    </li>
                    <li>
                      <strong>Choose Position:</strong> Click a drop zone in
                      your timeline to place the card chronologically.
                    </li>
                    <li>
                      <strong>Placement Options:</strong> Choose "Before" the
                      first card or "After" any existing card.
                    </li>
                    <li>
                      <strong>Get Feedback:</strong> You'll see if your
                      placement was correct or incorrect.
                    </li>
                    <li>
                      <strong>Continue:</strong> Keep placing cards until you
                      have 10 correct placements!
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Scoring</h3>
                  <p>
                    You earn points for each correctly placed card. The game
                    tracks your progress as you build your historical timeline.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Multiplayer
                  </h3>
                  <p>
                    In multiplayer mode, take turns with your opponent. Only
                    place cards during your turn, and try to be the first to get
                    10 correct placements!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>)}
    </header>);
}
