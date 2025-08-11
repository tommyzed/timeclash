import { useState } from "react";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NicknameModalProps {
  isOpen: boolean;
  onSubmit: (nickname: string) => void;
  onCancel: () => void;
  roomCode?: string;
}

export default function NicknameModal({
  isOpen,
  onSubmit,
  onCancel,
  roomCode,
}: NicknameModalProps) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError("Please enter a nickname");
      return;
    }
    
    if (nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters");
      return;
    }
    
    if (nickname.trim().length > 20) {
      setError("Nickname must be 20 characters or less");
      return;
    }
    
    onSubmit(nickname.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Join Game Room</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="close-nickname-modal"
            aria-label="Cancel joining"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {roomCode && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Room Code:</span> {roomCode}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose your nickname
            </label>
            <p className="text-sm text-gray-500 mb-3">
              This is how other players will see you in the game.
            </p>
            <Input
              type="text"
              value={nickname}
              onChange={handleInputChange}
              placeholder="Enter your nickname..."
              className={`w-full ${error ? "border-red-500" : ""}`}
              maxLength={20}
              autoFocus
              data-testid="nickname-input"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1" data-testid="nickname-error">
                {error}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              data-testid="join-game-button"
            >
              Join Game
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              data-testid="cancel-join-button"
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            You're about to join a multiplayer game. Have fun building timelines together!
          </p>
        </div>
      </div>
    </div>
  );
}