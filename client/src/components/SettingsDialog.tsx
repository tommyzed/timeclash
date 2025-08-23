import { X, HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { type GameState } from "@shared/schema";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: {
    targetScore: number;
    gameMode: "normal" | "hard";
    allowStealing: boolean;
  }) => void;
  onShowRules: () => void;
  game: GameState["game"];
  isMultiplayer: boolean;
  playerColor: string | null;
  handleColorChange: (color: string) => void;
}

export default function SettingsDialog({
  isOpen,
  onClose,
  onSettingsChange,
  onShowRules,
  game,
  isMultiplayer,
  playerColor,
  handleColorChange,
}: SettingsDialogProps) {
  const [targetScore, setTargetScore] = useState(game.targetScore);
  const [gameMode, setGameMode] = useState(game.gameMode);
  const [allowStealing, setAllowStealing] = useState(game.allowStealing);
  const [isScrolled, setIsScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTargetScore(game.targetScore);
    setGameMode(game.gameMode);
    setAllowStealing(game.allowStealing);
  }, [game.targetScore, game.gameMode, game.allowStealing]);

  useEffect(() => {
    const contentElement = contentRef.current;
    const handleScroll = () => {
      if (contentElement) {
        setIsScrolled(contentElement.scrollTop > 0);
      }
    };

    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  if (!isOpen) return null;

  const availableColors = [
    "blue",
    "orange",
    "green",
    "pink",
    "purple",
    "red",
    "yellow",
  ];

  const handleSaveChanges = () => {
    onSettingsChange({
      targetScore,
      gameMode: gameMode as "normal" | "hard",
      allowStealing,
    });
    onClose();
  };

  const handleCancel = () => {
    setTargetScore(game.targetScore);
    setGameMode(game.gameMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">Game Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="close-settings-modal"
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div
          ref={contentRef}
          className="flex-grow overflow-y-auto relative"
          style={{
            boxShadow: isScrolled
              ? "inset 0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              : "none",
            transition: "box-shadow 0.2s ease-in-out",
          }}
        >
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
                    localStorage.setItem("targetScore", newScore.toString());
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

            {!isMultiplayer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Mode
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  In Hard Mode, you have a limited number of attempts to reach
                  the target.
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
                  When a player makes an incorrect move, the opponent can try
                  to steal the card.
                </p>
              </div>
            )}

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
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              data-testid="cancel-settings-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              data-testid="save-settings-button"
            >
              Apply Settings
            </button>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="space-y-3">
              <button
                className="w-full bg-gray-100 hover:bg-blue-100 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-start"
                onClick={onShowRules}
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
  );
}
