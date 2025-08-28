import { useState, useEffect, useRef } from "react";
import { X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface Settings {
  targetScore: number;
  gameMode: "normal" | "hard";
  allowStealing: boolean;
  categories: string[];
  eras: string[];
}

import { toast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: Settings) => void;
  initialSettings: Settings;
  isMultiplayer: boolean;
  playerColor: string | null;
  soundsEnabled: boolean;
  onPlayerColorChange: (color:string) => void;
  onSoundsEnabledChange: (enabled: boolean) => void;
  onShowRules: () => void;
  toast: typeof toast;
}

export default function SettingsDialog({
  isOpen,
  onClose,
  onSettingsChange,
  initialSettings,
  isMultiplayer,
  playerColor,
  soundsEnabled,
  onPlayerColorChange,
  onSoundsEnabledChange,
  onShowRules,
  toast,
}: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Internal state for the dialog
  const [targetScore, setTargetScore] = useState(initialSettings.targetScore);
  const [gameMode, setGameMode] = useState(initialSettings.gameMode);
  const [allowStealing, setAllowStealing] = useState(
    initialSettings.allowStealing,
  );
  const [categories, setCategories] = useState<string[]>(
    initialSettings.categories,
  );
  const [eras, setEras] = useState<string[]>(initialSettings.eras || ["Ancient", "Classical", "Modern"]);
  const [internalPlayerColor, setInternalPlayerColor] = useState(playerColor);
  const [internalSoundsEnabled, setInternalSoundsEnabled] = useState(soundsEnabled);
  const [isScrolled, setIsScrolled] = useState(false);

  // Reset internal state when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      setTargetScore(initialSettings.targetScore);
      setGameMode(initialSettings.gameMode);
      setAllowStealing(initialSettings.allowStealing);
      setCategories(initialSettings.categories);
      setEras(initialSettings.eras || ["Ancient", "Classical", "Modern"]);
      setInternalPlayerColor(playerColor);
      setInternalSoundsEnabled(soundsEnabled);
      setIsScrolled(false); // Reset scroll state
    }
  }, [isOpen, initialSettings]);

  // Effect to lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Effect to handle clicks outside the dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const availableColors = [
    "blue",
    "orange",
    "green",
    "pink",
    "purple",
    "red",
    "yellow",
  ];

  const handleCategoryChange = (category: string) => {
    setCategories((prev) => {
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      if (newCategories.length === 0) {
        return prev;
      }
      return newCategories;
    });
  };

  const availableEras = ["Ancient", "Classical", "Modern"];

  const handleEraChange = (era: string) => {
    setEras((prev) => {
      const newEras = prev.includes(era)
        ? prev.filter((c) => c !== era)
        : [...prev, era];
      if (newEras.length === 0) {
        return prev;
      }
      return newEras;
    });
  };

  const handleApply = () => {
    onSettingsChange({
      targetScore,
      gameMode,
      allowStealing,
      categories,
      eras,
    });
    if (internalPlayerColor) {
      onPlayerColorChange(internalPlayerColor);
    }
    onSoundsEnabledChange(internalSoundsEnabled);
    onClose();
    if (!isMultiplayer) {
      toast({
        title: "Settings Saved",
        description: "Your new settings have been applied.",
        variant: "success",
        emoji: "👍",
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    setIsScrolled(scrollTop > 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={dialogRef}
        className="bg-white rounded-lg max-w-md w-full flex flex-col max-h-[90vh]"
      >
        <div
          className={cn(
            "flex items-center justify-between p-4 border-b bg-blue-100 transition-shadow",
            isScrolled && "shadow-sm",
          )}
        >
          <h2 className="text-xl font-bold text-gray-900">Game Settings</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="close-settings-modal"
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto" onScroll={handleScroll}>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="text-sm font-semibold text-gray-700"
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
                  When a player makes an incorrect move, the opponent can try to
                  steal the card.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Eras
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Choose which eras of events to include in the game.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {availableEras.map(
                  (era) => (
                    <div key={era} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`era-${era}`}
                        checked={eras.includes(era)}
                        onChange={() => handleEraChange(era)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`era-${era}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {era}
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Categories
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Choose which categories of events to include in the game.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Politics", "Science", "History", "Culture"].map(
                  (category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {category}
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div>

            <Separator className="my-6 bg-gray-300" />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                My Card Color
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Choose the color for the cards you place on the timeline.
              </p>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setInternalPlayerColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform transform hover:scale-110 ${
                      internalPlayerColor === color
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sound Effects
              </label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Enable or disable game sounds.
                </p>
                <Switch
                  checked={internalSoundsEnabled}
                  onCheckedChange={(checked) => {
                    setInternalSoundsEnabled(checked);
                    localStorage.setItem("soundsEnabled", checked.toString());
                  }}
                  data-testid="sounds-enabled-switch"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-blue-100 flex justify-between items-center">
          <button
            className="text-sm text-gray-600 hover:text-blue-600 flex items-center transition-colors"
            onClick={() => {
              onShowRules();
              onClose();
            }}
            data-testid="button-rules"
          >
            <HelpCircle className="mr-1 h-4 w-4" />
            View Rules
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              data-testid="cancel-settings-button"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              data-testid="save-settings-button"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
