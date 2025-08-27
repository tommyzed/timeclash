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
import SettingsDialog from "./SettingsDialog";

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
    categories: string[];
    eras: string[];
  }) => void;
  onNewGame?: () => void;
  playerColor?: string | null;
  setPlayerColor?: (color: string) => void;
  soundsEnabled: boolean;
  onSoundsEnabledChange: (enabled: boolean) => void;
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
  soundsEnabled,
  onSoundsEnabledChange,
}: GameHeaderProps) {
  const { game } = gameState;
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

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
    

    const isHardMode = game.gameMode === "hard";
    return (
      <span
        className={`text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
          isHardMode ? "bg-red-600" : "bg-blue-600"
        }`}
      >
        <span>Single</span>
        {isHardMode && (
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

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={(newSettings) => {
          if (onSettingsChange) {
            onSettingsChange(newSettings);
          }
        }}
        initialSettings={{
          targetScore: game.targetScore,
          gameMode: game.gameMode as "normal" | "hard",
          allowStealing: game.allowStealing,
          categories: game.categories,
          eras: game.eras,
        }}
        isMultiplayer={isMultiplayer ?? false}
        playerColor={playerColor ?? null}
        onPlayerColorChange={handleColorChange}
        soundsEnabled={soundsEnabled}
        onSoundsEnabledChange={onSoundsEnabledChange}
        onShowRules={() => setShowRulesModal(true)}
      />

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
