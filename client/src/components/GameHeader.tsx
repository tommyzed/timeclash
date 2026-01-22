import {
  Clock,
  Settings,
  Copy,
  Check,
  X,
  Sparkles,
  Home,
  HelpCircle,
  UserPlus,
  UserCheck,
  Heart,
  User,
} from "lucide-react";
import { type GameState } from "@shared/schema";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AddFriendDialog from "./AddFriendDialog";
import FriendRequestDialog from "./FriendRequestDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import logoImage from "@assets/TimeClash.png";
import burglarIcon from "@/assets/burglar.png";
import muscleIcon from "@/assets/weights.png";
import volumeIcon from "@/assets/volume.png";
import Auth from "@/components/Auth";
import { useUser } from "@/context/UserContext";
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
import { toast } from "@/hooks/use-toast";

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
  opponentPlayerColor?: string | null;
  setPlayerColor?: (color: string) => void;
  soundsEnabled: boolean;
  onSoundsEnabledChange: (enabled: boolean) => void;
  toast: typeof toast;
  colorToEmoji: { [key: string]: string };
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
  opponentPlayerColor,
  setPlayerColor,
  soundsEnabled,
  onSoundsEnabledChange,
  toast,
  colorToEmoji,
}: GameHeaderProps) {
  const { game } = gameState;
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { user } = useUser();

  const handleColorChange = async (color: string) => {
    if (playerColor === color) return;
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
              const emoji = colorToEmoji[color] || "🎨";
              toast({
                title: "Color Changed!",
                description: `Your card color is now ${color}.`,
                variant: "success",
                emoji: emoji,
              });
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
            {soundsEnabled && (
              <img
                src={volumeIcon}
                alt="Sound is enabled"
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
            <span className="hidden sm:inline">Share: </span>
            <span>{game.roomCode}</span>
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
        className={`text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${isHardMode ? "bg-red-600" : "bg-blue-500"
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
        {soundsEnabled && (
          <img
            src={volumeIcon}
            alt="Sound is enabled"
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

      const player1Color = isCurrentPlayerPlayer1
        ? playerColor
        : opponentPlayerColor;
      const player2Color = isCurrentPlayerPlayer1
        ? opponentPlayerColor
        : playerColor;

      return (
        <div className="flex items-center space-x-4">
          <div className="text-center" data-testid="score-display">
            <div
              className="text-lg font-bold"
              style={{ color: player1Color || "blue" }}
            >
              {player1Score}
            </div>
            <div className="text-xs text-gray-500 uppercase">
              {player1Nickname}
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-lg font-bold"
              style={{ color: player2Color || "orange" }}
            >
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
            <Sparkles className="h-5 w-5 text-gray-600" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🤔 Start a New Game?</AlertDialogTitle>
            <AlertDialogDescription>
              ❗ This will pause your current game and start a fresh one. ❗
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
      <Auth />
    </div>
  );

  // Friend Logic
  const { data: friends = [] } = useQuery<any[]>({
    queryKey: ["/api/friends"],
    enabled: !!user,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showFriendRequest, setShowFriendRequest] = useState(false);

  const opponentUserId = isMultiplayer
    ? (user?.id === game.player1UserId ? game.player2UserId : game.player1UserId)
    : null;

  const friendship = friends.find(
    (f) =>
      (f.userId1 === opponentUserId) || (f.userId2 === opponentUserId)
  );

  const friendStatus = friendship
    ? friendship.status === "accepted"
      ? "friends"
      : friendship.userId1 === user?.id
        ? "sent"
        : "received"
    : "none";

  const handleAddFriend = async () => {
    try {
      if (!opponentUserId) return;
      await apiRequest("POST", "/api/friends/request", { targetUserId: opponentUserId });
      await queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend Request Sent!",
        description: "Hope they say yes!",
        emoji: "💌",
        variant: "success",
      });
      setShowAddFriend(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request.",
        variant: "destructive",
      });
    }
  }

  const handleAcceptFriend = async () => {
    try {
      if (!friendship) return;
      await apiRequest("POST", `/api/friends/${friendship.id}/accept`);
      await queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend Accepted!",
        variant: "success",
        emoji: "🎉",
      });
      setShowFriendRequest(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept.",
        variant: "destructive",
      });
    }
  }

  const handleDenyFriend = async () => {
    try {
      if (!friendship) return;
      await apiRequest("DELETE", `/api/friends/${friendship.id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      setShowFriendRequest(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny.",
        variant: "destructive",
      });
    }
  }

  // Effect to show popup if request received while looking
  useEffect(() => {
    if (friendStatus === "received" && !showFriendRequest) {
      // Logic to prevent showing it incessantly? 
      // For now, let's show it. But maybe only if it's "new"?
      // We can't easily track "new" without local state diff.
      // But if we just loaded and it's received, showing it is fine.
      setShowFriendRequest(true);
    }
  }, [friendStatus]);


  const FriendAction = () => {
    if (!opponentUserId || !user) return null;

    if (friendStatus === "friends") {
      return (
        <div className="p-2 rounded-lg bg-green-50 text-green-600" title="You are friends!">
          <div className="flex items-center space-x-1">
            <Heart className="h-5 w-5 fill-current" />
            <span className="text-xs font-bold hidden sm:inline">BFFs</span>
          </div>
        </div>
      );
    }

    if (friendStatus === "sent") {
      return (
        <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600" title="Request Pending">
          <Clock className="h-5 w-5" />
        </div>
      );
    }

    if (friendStatus === "received") {
      return (
        <button
          onClick={() => setShowFriendRequest(true)}
          className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 animate-pulse"
          title="Respond to Friend Request"
        >
          <UserCheck className="h-5 w-5" />
        </button>
      );
    }

    // Default: Add Friend
    return (
      <button
        onClick={() => setShowAddFriend(true)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
        title="Add Friend"
      >
        <UserPlus className="h-5 w-5" />
      </button>
    );
  };


  return (
    <header className="bg-white shadow-sm border-b" data-testid="game-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {user ? (
              isMobile ? (
                <button
                  className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  title="Return to Lobby"
                  onClick={() => setLocation("/")}
                >
                  <Home className="w-6 h-6" />
                </button>
              ) : (
                <img
                  src={logoImage}
                  alt="It's About Time!!"
                  className="h-12 w-auto cursor-pointer"
                  data-testid="game-header-logo"
                  onClick={() => setLocation("/")}
                />
              )
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  {isMobile ? (
                    <button
                      className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
                      title="Return to Lobby"
                    >
                      <Home className="w-6 h-6" />
                    </button>
                  ) : (
                    <img
                      src={logoImage}
                      alt="It's About Time!!"
                      className="h-12 w-auto cursor-pointer"
                      data-testid="game-header-logo"
                    />
                  )}
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
            )}
            {getGameModeDisplay()}
          </div>
          {!isMobile ? (
            <div className="flex items-center space-x-6">
              {getScoreDisplay()}
              <div className="flex items-center space-x-2">
                <FriendAction />
                <GameActions />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <FriendAction />
              <GameActions />
            </div>
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
        toast={toast}
      />

      <AddFriendDialog
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        onConfirm={handleAddFriend}
        opponentName={opponentNickname || "Opponent"}
      // Use logic from existing component: 
      // const player1Nickname = isCurrentPlayerPlayer1 ? nickname || "Player 1" : opponentNickname || "Player 2";
      // opponentNickname is passed as prop!
      // So just use opponentNickname.
      />

      <FriendRequestDialog
        isOpen={showFriendRequest}
        onClose={() => setShowFriendRequest(false)} // "Decide Later"
        onAccept={handleAcceptFriend}
        onDeny={handleDenyFriend}
        requesterName={opponentNickname || "Opponent"}
        requesterPicture={null} // We don't have picture in GameHeader currently. Maybe in future.
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
