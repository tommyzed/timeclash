import { Clock, Settings, Copy, Check } from "lucide-react";
import { type GameState } from "@shared/schema";
import { useState } from "react";

interface GameHeaderProps {
  gameState: GameState;
  isMultiplayer?: boolean;
  currentPlayerId?: string;
  nickname?: string;
}

export default function GameHeader({ gameState, isMultiplayer, currentPlayerId, nickname }: GameHeaderProps) {
  const { game } = gameState;
  const [copied, setCopied] = useState(false);

  const handleCopyRoomCode = async () => {
    if (game.roomCode) {
      try {
        await navigator.clipboard.writeText(game.roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy room code:', err);
      }
    }
  };
  
  const getGameModeDisplay = () => {
    if (isMultiplayer && game.roomCode) {
      return (
        <div className="flex items-center space-x-2">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Multiplayer
          </span>
          <button
            onClick={handleCopyRoomCode}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors"
            data-testid="copy-room-code-button"
            title="Click to copy room code"
          >
            <span>Room: {game.roomCode}</span>
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
      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
        Single Player
      </span>
    );
  };

  const getScoreDisplay = () => {
    if (isMultiplayer) {
      const currentPlayerScore = currentPlayerId === game.player1Id ? game.player1Score : game.player2Score;
      const opponentScore = currentPlayerId === game.player1Id ? game.player2Score : game.player1Score;
      
      return (
        <div className="flex items-center space-x-4">
          <div className="text-center" data-testid="score-display">
            <div className="text-lg font-bold text-blue-600">{currentPlayerScore}</div>
            <div className="text-xs text-gray-500">YOUR SCORE</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{opponentScore}</div>
            <div className="text-xs text-gray-500">OPPONENT</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">{game.targetScore}</div>
            <div className="text-xs text-gray-500">TARGET</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-6">
        <div className="text-center" data-testid="score-display">
          <div className="text-2xl font-bold text-blue-600">{game.player1Score || 0}</div>
          <div className="text-xs text-gray-500">CARDS PLACED</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400">{game.targetScore}</div>
          <div className="text-xs text-gray-500">TARGET</div>
        </div>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b" data-testid="game-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              <Clock className="inline-block text-blue-600 mr-2 h-7 w-7" />
              Chronology
            </h1>
            {getGameModeDisplay()}
            {nickname && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                {nickname}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {getScoreDisplay()}
            <button 
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
              data-testid="settings-button"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
