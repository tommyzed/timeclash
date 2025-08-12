import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/It's About Time Logo -sm_1754907859214.png";

export default function Lobby() {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [activeTab, setActiveTab] = useState("single");
  const [, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();

  // Handle shareable room links
  useEffect(() => {
    if (params.roomCode) {
      console.log("Shareable link detected, room code:", params.roomCode);
      setRoomCode(params.roomCode);
      setActiveTab("join");
      
      toast({
        title: "Room Link Opened!",
        description: `Ready to join room ${params.roomCode}. Just enter your nickname and click Join Game.`,
        variant: "success",
      });
    }
  }, [params.roomCode, toast]);

  const createSinglePlayerMutation = useMutation({
    mutationFn: async () => {
      // Create single-player game without room code or player system
      const gameResponse = await apiRequest("POST", "/api/games", {
        singlePlayer: true,
      });
      const game = await gameResponse.json();
      return { game, singlePlayer: true };
    },
    onSuccess: (data) => {
      // Clear any previous multiplayer data
      localStorage.removeItem("playerId");
      localStorage.removeItem("nickname");
      localStorage.setItem("gameId", data.game.id);

      navigate(`/game/${data.game.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create single player game",
        variant: "destructive",
      });
    },
  });

  const createMultiplayerGameMutation = useMutation({
    mutationFn: async () => {
      if (!nickname.trim()) {
        throw new Error("Please enter a nickname");
      }

      // Create player first
      const playerResponse = await apiRequest("POST", "/api/players", {
        nickname: nickname.trim(),
      });
      const player = await playerResponse.json();

      // Create game with room code
      const gameResponse = await apiRequest("POST", "/api/games", {});
      const game = await gameResponse.json();

      // Join the game as player 1
      const joinResponse = await apiRequest("POST", "/api/games/join", {
        roomCode: game.roomCode,
        nickname: nickname.trim(),
      });
      const joinResult = await joinResponse.json();

      return { ...joinResult, roomCode: game.roomCode };
    },
    onSuccess: (data) => {
      // Store player info in localStorage
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("gameId", data.game.id);

      toast({
        title: "Multiplayer Game Created!",
        description: `Room code: ${data.roomCode}. Share this with your friend!`,
        variant: "warning",
      });

      navigate(`/game/${data.game.id}?playerId=${data.playerId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create game",
        variant: "destructive",
      });
    },
  });

  const joinGameMutation = useMutation({
    mutationFn: async () => {
      if (!nickname.trim()) {
        throw new Error("Please enter a nickname");
      }
      if (!roomCode.trim()) {
        throw new Error("Please enter a room code");
      }

      const response = await apiRequest("POST", "/api/games/join", {
        roomCode: roomCode.trim().toUpperCase(),
        nickname: nickname.trim(),
      });

      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      // Store player info in localStorage
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("gameId", data.game.id);

      toast({
        title: "Joined Game!",
        description: `Welcome to the game, ${nickname}!`,
      });

      navigate(`/game/${data.game.id}?playerId=${data.playerId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join game",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              src={logoImage} 
              alt="It's About Time!!" 
              className="mx-auto h-32 w-auto"
              data-testid="game-logo"
            />
          </div>
          <p className="text-[#0798a5] font-semibold">
            Play a historical timeline game with friends!
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col space-y-1.5 p-6 text-[#0c8557]">
            <CardTitle>Game Lobby</CardTitle>
            <CardDescription>Choose your game mode</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
                <TabsTrigger
                  value="single"
                  className="relative text-muted-foreground data-[state=active]:bg-[#0c8557] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-[#0c8557]/10"
                >
                  Single Player
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="relative text-muted-foreground data-[state=active]:bg-[#0c8557] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-[#0c8557]/10"
                >
                  Create Room
                </TabsTrigger>
                <TabsTrigger
                  value="join"
                  className="relative text-muted-foreground data-[state=active]:bg-[#0c8557] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-[#0c8557]/10"
                >
                  Join Room
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4 mt-6">
                <div className="text-center space-y-4 p-4 bg-[#0c8557]/5 rounded-lg border border-[#0c8557]/20">
                  <div className="w-12 h-12 mx-auto bg-[#0c8557]/10 rounded-full flex items-center justify-center">
                    <span className="text-[#0c8557] text-xl">🎮</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Play solo and challenge yourself to build the perfect
                    timeline!
                  </p>
                  <Button
                    onClick={() => createSinglePlayerMutation.mutate()}
                    disabled={createSinglePlayerMutation.isPending}
                    className="w-full bg-[#0c8557] hover:bg-[#0c8557]/90"
                    data-testid="button-single-player"
                  >
                    {createSinglePlayerMutation.isPending
                      ? "Starting..."
                      : "Start Single Player Game"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-4 mt-6">
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">+</span>
                    </div>
                    <h3 className="font-medium text-blue-900">
                      Host a New Game
                    </h3>
                  </div>
                  <div>
                    <label
                      htmlFor="create-nickname"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Your Nickname
                    </label>
                    <Input
                      id="create-nickname"
                      placeholder="Enter your nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      data-testid="input-nickname-create"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-sm text-blue-600">
                    Create a new game and get a room code to share with a
                    friend.
                  </p>
                  <Button
                    onClick={() => createMultiplayerGameMutation.mutate()}
                    disabled={
                      createMultiplayerGameMutation.isPending ||
                      !nickname.trim()
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-create-game"
                  >
                    {createMultiplayerGameMutation.isPending
                      ? "Creating..."
                      : "Create Multiplayer Game"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="join" className="space-y-4 mt-6">
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm">→</span>
                    </div>
                    <h3 className="font-medium text-purple-900">
                      Join Friend's Game
                    </h3>
                  </div>
                  <div>
                    <label
                      htmlFor="join-nickname"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Your Nickname
                    </label>
                    <Input
                      id="join-nickname"
                      placeholder="Enter your nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      data-testid="input-nickname-join"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="roomCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Room Code
                    </label>
                    <Input
                      id="roomCode"
                      placeholder="Enter room code"
                      value={roomCode}
                      onChange={(e) =>
                        setRoomCode(e.target.value.toUpperCase())
                      }
                      data-testid="input-room-code"
                      className="border-purple-200 focus:border-purple-500 font-mono text-center"
                    />
                  </div>
                  <Button
                    onClick={() => joinGameMutation.mutate()}
                    disabled={
                      joinGameMutation.isPending ||
                      !nickname.trim() ||
                      !roomCode.trim()
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-join-game"
                  >
                    {joinGameMutation.isPending ? "Joining..." : "Join Game"}
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
