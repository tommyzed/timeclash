import { useState, useEffect, useMemo } from "react";
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
import logoImage from "@assets/TimeClash.png";
import { CoffeeIcon } from "@/components/ui/CoffeeIcon";
import Auth from "@/components/Auth";
import { useUser } from "@/context/UserContext";
import { useUserGames, type EnrichedGame } from "@/hooks/useUserGames";
import { Bell, Sparkles, ArrowRight } from "lucide-react";
import { getGeoInfo } from "@/lib/geo";

export default function Lobby() {
  const { user } = useUser();
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [activeTab, setActiveTab] = useState("single");
  const [, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();

  // Fetch user's games to check for games awaiting their turn
  const { activeGames } = useUserGames();

  // Calculate games where it's the user's turn
  const gamesAwaitingTurn = useMemo(() => {
    if (!user || !activeGames) return [];

    const allGames = [
      ...(activeGames.activeGames || []),
    ];

    return allGames.filter((game: EnrichedGame) => {
      // Only consider multiplayer games (with roomCode)
      if (!game.roomCode || !game.currentTurn) return false;

      // Determine if user is player1 or player2
      const isPlayer1 = game.player1UserId === user.id;
      const currentTurnIsPlayer1 = game.currentTurn === "player1";

      // Return true if it's the user's turn
      return isPlayer1 === currentTurnIsPlayer1;
    });
  }, [user, activeGames]);

  useEffect(() => {
    if (user?.name) {
      setNickname(user.name);
    }
  }, [user]);

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
        emoji: "🤗",
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
        emoji: "🐳",
      });
    },
  });

  const createMultiplayerGameMutation = useMutation({
    mutationFn: async () => {
      if (!nickname.trim()) {
        throw new Error("Please enter a nickname");
      }

      // Create game with room code
      const gameResponse = await apiRequest("POST", "/api/games", {});
      const game = await gameResponse.json();

      // Join the game as player 1 (server creates the player)
      const geoInfo = await getGeoInfo();
      const joinResponse = await apiRequest("POST", "/api/games/join", {
        roomCode: game.roomCode,
        nickname: nickname.trim(),
        ...geoInfo,
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
        variant: "success",
        emoji: "😸",
      });

      navigate(`/game/${data.game.id}?playerId=${data.playerId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create game",
        variant: "destructive",
        emoji: "🐳",
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

      const geoInfo = await getGeoInfo();
      const response = await apiRequest("POST", "/api/games/join", {
        roomCode: roomCode.trim().toUpperCase(),
        nickname: nickname.trim(),
        ...geoInfo,
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
        variant: "warning",
        emoji: "🥳",
      });

      navigate(`/game/${data.game.id}?playerId=${data.playerId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join game",
        variant: "destructive",
        emoji: "🐳",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-2">
          <div className="mb-2">
            <img
              src={logoImage}
              alt="It's About Time!!"
              className="mx-auto h-48 w-auto"
              data-testid="game-logo"
            />
          </div>
          <p className="text-[#0798a5] font-semibold">
            Play a historical timeline game with friends!
          </p>
        </div>

        <Card>
          <CardHeader
            className={`flex ${user ? "flex-row items-center" : "flex-col-reverse items-center gap-4"} justify-between p-4 text-[#0c8557]`}
          >
            <div className="flex flex-col space-y-0.5 items-center">
              <CardTitle>Game Lobby</CardTitle>
              <CardDescription>Choose your game mode</CardDescription>
            </div>

            {/* If user is logged in, keep original layout (direct children) */}
            {user ? (
              <>
                <a
                  href="https://ko-fi.com/egodevnull"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border hover:text-accent-foreground h-8 rounded-md px-3 text-xs bg-yellow-400 hover:bg-yellow-500 text-black dark:text-black border-yellow-400 shadow-md shadow-yellow-300/50"
                  data-testid="buy-me-a-coffee-link"
                >
                  <CoffeeIcon className="mr-2 sm:mr-1 md:mr-2" />
                  <span className="hidden md:block font-semibold">
                    Buy me a coffee
                  </span>
                  <span className="block md:hidden font-semibold">Coffee</span>
                </a>
                <Auth />
              </>
            ) : (
              /* If user is logged out, stack buttons on mobile */
              <div className="flex w-full justify-between items-center gap-2">
                <a
                  href="https://ko-fi.com/egodevnull"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border hover:text-accent-foreground h-8 rounded-md px-3 text-xs bg-yellow-400 hover:bg-yellow-500 text-black dark:text-black border-yellow-400 shadow-md shadow-yellow-300/50"
                  data-testid="buy-me-a-coffee-link"
                >
                  <CoffeeIcon className="mr-2 sm:mr-1 md:mr-2" />
                  <span className="hidden md:block font-semibold">
                    Buy me a coffee
                  </span>
                  <span className="block md:hidden font-semibold">Coffee</span>
                </a>
                <Auth />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {user && (
              <div className="mb-6">
                {gamesAwaitingTurn.length > 0 ? (
                  /* Alert-style notification widget with bouncing badge */
                  <div
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-all group shadow-md hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Bell className="w-6 h-6 text-white animate-pulse" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm animate-bounce">
                        {gamesAwaitingTurn.length}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900">
                        {gamesAwaitingTurn.length === 1
                          ? "1 game is waiting for your move!"
                          : `${gamesAwaitingTurn.length} games are waiting for your move!`}
                      </p>
                      <p className="text-xs text-amber-700">Click to view in Dashboard</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                ) : (
                  /* Standard Dashboard button when no games awaiting */
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full h-12 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                    <span className="text-base">View Your Dashboard</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            )}
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
                  <div className="flex items-center">
                    <label
                      htmlFor="create-nickname"
                      className="block text-sm font-medium text-gray-700 mr-2"
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
                  <div className="flex items-center">
                    <label
                      htmlFor="join-nickname"
                      className="block text-sm font-medium text-gray-700 mr-2"
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
                  <div className="flex items-center">
                    <label
                      htmlFor="roomCode"
                      className="block text-sm font-medium text-gray-700 mr-2"
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
