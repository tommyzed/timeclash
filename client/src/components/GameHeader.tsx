import {
  Clock,
  Settings,
  Copy,
  Check,
  X,
  RotateCcw,
  Home,
  HelpCircle,
} from "lucide-react";
import { type GameState } from "@shared/schema";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import logoImage from "@assets/It's About Time Logo -sm_1754907859214.png";
import burglarIcon from "@/assets/burglar.png";
import muscleIcon from "@/assets/weights.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GameHeaderProps {
  gameState: GameState;
  isMultiplayer?: boolean;
  currentPlayerId?: string;
  nickname?: string;
  opponentNickname?: string;
  onSettingsChange?: (settings: {
    targetScore: number;
    gameMode: "normal" | "hard";
    allowStealing: boolean;
  }) => void;
  onNewGame?: () => void;
  playerColor?: string | null;
  setPlayerColor?: (color: string) => void;
}

export default function GameHeader({
  gameState,
  isMultiplayer,
  currentPlayerId,
  nickname,
  opponentNickname,
  onSettingsChange,
  onNewGame,
  playerColor,
  setPlayerColor,
}: GameHeaderProps) {
  const { game } = gameState;
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [targetScore, setTargetScore] = useState(game.targetScore);
  const [gameMode, setGameMode] = useState(game.gameMode);
  const [allowStealing, setAllowStealing] = useState(game.allowStealing);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    setTargetScore(game.targetScore);
    setGameMode(game.gameMode);
    setAllowStealing(game.allowStealing);
  }, [game.targetScore, game.gameMode, game.allowStealing]);

  useEffect(() => {
    if (showSettings) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSettings]);

  const availableColors = [
    "blue",
    "orange",
    "green",
    "pink",
    "purple",
    "red",
    "yellow",
  ];

  const handleColorChange = async (color: string) => {
    if (setPlayerColor) {
      if (isMultiplayer) {
        if (currentPlayerId) {
          try {
            const response = await fetch(
              `/api/players/${currentPlayerId}/color`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ color }),
              },
            );
            if (response.ok) {
              setPlayerColor(color);
            }
          } catch (error) {
            console.error("Failed to update player color:", error);
          }
        }
      } else {
        // Single-player mode
        setPlayerColor(color);
        localStorage.setItem("playerColor", color);
      }
    }
  };

  const handleCopyRoomCode = async () => {
    if (game.roomCode) {
      try {
        const shareableLink = `${window.location.origin}/room/${game.roomCode}`;
        await navigator.clipboard.writeText(shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy shareable link:", err);
      }
    }
  };

  const getGameModeDisplay = () => {
    if (isMultiplayer && game.roomCode) {
      return (
        <div className="flex items-center space-x-2">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <span>Multi</span>
            {game.allowStealing && (
              <img
                src={burglarIcon}
                alt="Stealing is enabled"
                className="w-4 h-4"
              />
            )}
          </span>
          <button
            onClick={handleCopyRoomCode}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors"
            data-testid="copy-room-code-button"
            title="Click to copy shareable link"
          >
            <span>Share: {game.roomCode}</span>
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      );
    }
    return (
      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
        <span>Single</span>
        {game.gameMode === "hard" && (
          <img
            src={muscleIcon}
            alt="Hard mode is enabled"
            className="w-4 h-4"
          />
        )}
      </span>
    );
  };

  const getScoreDisplay = () => {
    if (isMultiplayer) {
      // Determine if current player is player1 or player2
      const isCurrentPlayerPlayer1 = currentPlayerId === game.player1Id;

      // Get scores for both players
      const player1Score = game.player1Score;
      const player2Score = game.player2Score;

      // Get nicknames - use nickname prop for current player, opponentNickname for the other
      const player1Nickname = isCurrentPlayerPlayer1
        ? nickname || "Player 1"
        : opponentNickname || "Player 2";
      const player2Nickname = isCurrentPlayerPlayer1
        ? opponentNickname || "Player 2"
        : nickname || "Player 2";

      return (
        <div className="flex items-center space-x-4">
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
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-6">
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
        {game.gameMode === "hard" && (
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {game.attempts} / {game.maxAttempts}
            </div>
            <div className="text-xs text-gray-500">ATTEMPTS</div>
          </div>
        )}
      </div>
    );
  };

  const GameActions = () => (
    <div
      className={
        isMobile
          ? "flex items-center space-x-1"
          : "flex items-center space-x-2"
      }
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
            data-testid="new-game-button"
            title="Start a new game"
          >
            <RotateCcw className="h-5 w-5 text-gray-600" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🤔 Start a New Game?</AlertDialogTitle>
            <AlertDialogDescription>
              ❗ This will end your current game and start a fresh one. ❗
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onNewGame) {
                  onNewGame();
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <button
        onClick={() => setShowSettings(true)}
        className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
        data-testid="settings-button"
      >
        <Settings className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b" data-testid="game-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <img
                  src={logoImage}
                  alt="It's About Time!!"
                  className="h-8 w-auto cursor-pointer"
                  data-testid="game-header-logo"
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    🤔 Return to the Game Lobby?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    ❗ Your game will immediately end and cannot be recovered! ❗
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setLocation("/")}>
                    Return to Lobby
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {getGameModeDisplay()}
          </div>
          {!isMobile ? (
            <div className="flex items-center space-x-6">
              {getScoreDisplay()}
              <GameActions />
            </div>
          ) : (
            <GameActions />
          )}
        </div>
        {isMobile && (
          <div className="mt-4 flex justify-center">{getScoreDisplay()}</div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Game Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                data-testid="close-settings-modal"
                aria-label="Close settings"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Score
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Number of cards to place correctly to win the game.
                  </p>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="5"
                      max="15"
                      value={targetScore}
                      onChange={(e) => {
                        const newScore = Number(e.target.value);
                        setTargetScore(newScore);
                        localStorage.setItem(
                          "targetScore",
                          newScore.toString(),
                        );
                      }}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      data-testid="target-score-slider"
                    />
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

                {/* Game Mode Selection */}
                {!isMultiplayer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Game Mode
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      In Hard Mode, you have a limited number of attempts to
                      reach the target.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setGameMode("normal");
                          localStorage.setItem("gameMode", "normal");
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                          gameMode === "normal"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        data-testid="normal-mode-button"
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => {
                          setGameMode("hard");
                          localStorage.setItem("gameMode", "hard");
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                          gameMode === "hard"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        data-testid="hard-mode-button"
                      >
                        Hard
                      </button>
                    </div>
                  </div>
                )}

                {/* Allow Stealing Option */}
                {isMultiplayer && (
                  <div>
                    <div className="flex items-center">
                      <label
                        htmlFor="allow-stealing"
                        className="text-sm font-medium text-gray-700"
                      >
                        Allow Stealing
                      </label>
                      <input
                        type="checkbox"
                        id="allow-stealing"
                        checked={allowStealing}
                        onChange={(e) => setAllowStealing(e.target.checked)}
                        data-testid="allow-stealing-switch"
                        className="ml-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      When a player makes an incorrect move, the opponent can
                      try to steal the card.
                    </p>
                  </div>
                )}

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    My Card Color
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Choose the color for the cards you place on the timeline.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-transform transform hover:scale-110 ${
                          playerColor === color
                            ? "border-blue-600 ring-2 ring-blue-600"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color }}
                        data-testid={`color-button-${color}`}
                        aria-label={`Select ${color} color`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (onSettingsChange) {
                      onSettingsChange({
                        targetScore,
                        gameMode: gameMode as "normal" | "hard",
                        allowStealing,
                      });
                    }
                    setShowSettings(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  data-testid="save-settings-button"
                >
                  Apply Settings
                </button>
                <button
                  onClick={() => {
                    setTargetScore(game.targetScore);
                    setGameMode(game.gameMode);
                    setShowSettings(false);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  data-testid="cancel-settings-button"
                >
                  Cancel
                </button>
              </div>

              {/* Game Controls Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3">
                  <button
                    className="w-full bg-gray-100 hover:bg-blue-100 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-start"
                    onClick={() => {
                      setShowRulesModal(true);
                      setShowSettings(false);
                    }}
                    data-testid="button-rules"
                  >
                    <HelpCircle className="mr-1 h-4 w-4" />
                    View Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Game Rules
                </h2>
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
        </div>
      )}
    </header>
  );
}
