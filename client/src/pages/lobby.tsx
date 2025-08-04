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

  const createGameMutation = useMutation({
    mutationFn: async () => {
      if (!nickname.trim()) {
        throw new Error('Please enter a nickname');
      }
      
      // Create player first
      const player = await apiRequest('/api/players', {
        method: 'POST',
        body: { nickname: nickname.trim() }
      });

      // Create game with room code
      const game = await apiRequest('/api/games', {
        method: 'POST',
        body: {}
      });

      // Join the game as player 1
      const joinResult = await apiRequest('/api/games/join', {
        method: 'POST',
        body: { roomCode: game.roomCode, nickname: nickname.trim() }
      });

      return { ...joinResult, roomCode: game.roomCode };
    },
    onSuccess: (data) => {
      // Store player info in localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('gameId', data.game.id);
      
      toast({
        title: "Game Created!",
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

      const result = await apiRequest('/api/games/join', {
        method: 'POST',
        body: { roomCode: roomCode.trim().toUpperCase(), nickname: nickname.trim() }
      });

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
            <CardTitle>Multiplayer Lobby</CardTitle>
            <CardDescription>Create a new game or join an existing one</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Nickname
                </label>
                <Input
                  id="nickname"
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  data-testid="input-nickname"
                />
              </div>
            </div>

            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Game</TabsTrigger>
                <TabsTrigger value="join">Join Game</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4">
                <p className="text-sm text-gray-600">
                  Create a new game and get a room code to share with a friend.
                </p>
                <Button 
                  onClick={() => createGameMutation.mutate()}
                  disabled={createGameMutation.isPending || !nickname.trim()}
                  className="w-full"
                  data-testid="button-create-game"
                >
                  {createGameMutation.isPending ? 'Creating...' : 'Create Game'}
                </Button>
              </TabsContent>
              
              <TabsContent value="join" className="space-y-4">
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
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => navigate('/game')}
                className="w-full"
                data-testid="button-single-player"
              >
                Play Single Player Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}