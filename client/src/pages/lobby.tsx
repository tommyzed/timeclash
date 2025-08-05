import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Lobby() {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const createSinglePlayerMutation = useMutation({
    mutationFn: async () => {
      // Create single-player game without room code or player system
      const gameResponse = await apiRequest('POST', '/api/games', { singlePlayer: true });
      const game = await gameResponse.json();
      return { game, singlePlayer: true };
    },
    onSuccess: (data) => {
      // Clear any previous multiplayer data
      localStorage.removeItem('playerId');
      localStorage.removeItem('nickname');
      localStorage.setItem('gameId', data.game.id);
      
      toast({
        title: "Single Player Game Started!",
        description: "Good luck building your timeline!",
      });
      
      navigate(`/game/${data.game.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to create single player game',
        variant: "destructive",
      });
    }
  });

  const createMultiplayerGameMutation = useMutation({
    mutationFn: async () => {
      if (!nickname.trim()) {
        throw new Error('Please enter a nickname');
      }
      
      // Create player first
      const playerResponse = await apiRequest('POST', '/api/players', { nickname: nickname.trim() });
      const player = await playerResponse.json();

      // Create game with room code
      const gameResponse = await apiRequest('POST', '/api/games', {});
      const game = await gameResponse.json();

      // Join the game as player 1
      const joinResponse = await apiRequest('POST', '/api/games/join', { 
        roomCode: game.roomCode, 
        nickname: nickname.trim() 
      });
      const joinResult = await joinResponse.json();

      return { ...joinResult, roomCode: game.roomCode };
    },
    onSuccess: (data) => {
      // Store player info in localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('gameId', data.game.id);
      
      toast({
        title: "Multiplayer Game Created!",
        description: `Room code: ${data.roomCode}. Share this with your friend!`,
      });
      
      navigate(`/game/${data.game.id}?playerId=${data.playerId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to create game',
        variant: "destructive",
      });
    }
  });

  const joinGameMutation = useMutation({
    mutationFn: async () => {
      if (!nickname.trim()) {
        throw new Error('Please enter a nickname');
      }
      if (!roomCode.trim()) {
        throw new Error('Please enter a room code');
      }

      const response = await apiRequest('POST', '/api/games/join', { 
        roomCode: roomCode.trim().toUpperCase(), 
        nickname: nickname.trim() 
      });
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      // Store player info in localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('gameId', data.game.id);
      
      toast({
        title: "Joined Game!",
        description: `Welcome to the game, ${nickname}!`,
      });
      
      navigate(`/game/${data.game.id}?playerId=${data.playerId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to join game',
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Chronology</h1>
          <p className="text-gray-600">Play historical timeline game with friends</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Game Lobby</CardTitle>
            <CardDescription>Choose your game mode</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="single">Single Player</TabsTrigger>
                <TabsTrigger value="create">Create Room</TabsTrigger>
                <TabsTrigger value="join">Join Room</TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="space-y-4">
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    Play solo and challenge yourself to build the perfect timeline!
                  </p>
                  <Button
                    onClick={() => createSinglePlayerMutation.mutate()}
                    disabled={createSinglePlayerMutation.isPending}
                    className="w-full"
                    data-testid="button-single-player"
                  >
                    {createSinglePlayerMutation.isPending ? 'Starting...' : 'Start Single Player Game'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="create-nickname" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Nickname
                    </label>
                    <Input
                      id="create-nickname"
                      placeholder="Enter your nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      data-testid="input-nickname-create"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Create a new game and get a room code to share with a friend.
                  </p>
                <Button 
                  onClick={() => createMultiplayerGameMutation.mutate()}
                  disabled={createMultiplayerGameMutation.isPending || !nickname.trim()}
                  className="w-full"
                  data-testid="button-create-game"
                >
                  {createMultiplayerGameMutation.isPending ? 'Creating...' : 'Create Multiplayer Game'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="join" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="join-nickname" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Nickname
                    </label>
                    <Input
                      id="join-nickname"
                      placeholder="Enter your nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      data-testid="input-nickname-join"
                    />
                  </div>
                  <div>
                    <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Room Code
                    </label>
                    <Input
                      id="roomCode"
                      placeholder="Enter room code"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      data-testid="input-room-code"
                    />
                  </div>
                  <Button 
                    onClick={() => joinGameMutation.mutate()}
                    disabled={joinGameMutation.isPending || !nickname.trim() || !roomCode.trim()}
                    className="w-full"
                    data-testid="button-join-game"
                >
                  {joinGameMutation.isPending ? 'Joining...' : 'Join Game'}
                </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}