var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/It's About Time Logo -sm_1754907859214.png";
export default function Lobby() {
    var _this = this;
    var _a = useState(""), nickname = _a[0], setNickname = _a[1];
    var _b = useState(""), roomCode = _b[0], setRoomCode = _b[1];
    var _c = useState("single"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = useLocation(), navigate = _d[1];
    var params = useParams();
    var toast = useToast().toast;
    // Handle shareable room links
    useEffect(function () {
        if (params.roomCode) {
            console.log("Shareable link detected, room code:", params.roomCode);
            setRoomCode(params.roomCode);
            setActiveTab("join");
            toast({
                title: "Room Link Opened!",
                description: "Ready to join room ".concat(params.roomCode, ". Just enter your nickname and click Join Game."),
                variant: "success",
            });
        }
    }, [params.roomCode, toast]);
    var createSinglePlayerMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var gameResponse, game;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/games", {
                            singlePlayer: true,
                        })];
                    case 1:
                        gameResponse = _a.sent();
                        return [4 /*yield*/, gameResponse.json()];
                    case 2:
                        game = _a.sent();
                        return [2 /*return*/, { game: game, singlePlayer: true }];
                }
            });
        }); },
        onSuccess: function (data) {
            // Clear any previous multiplayer data
            localStorage.removeItem("playerId");
            localStorage.removeItem("nickname");
            localStorage.setItem("gameId", data.game.id);
            navigate("/game/".concat(data.game.id));
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to create single player game",
                variant: "destructive",
            });
        },
    });
    var createMultiplayerGameMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var gameResponse, game, joinResponse, joinResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!nickname.trim()) {
                            throw new Error("Please enter a nickname");
                        }
                        return [4 /*yield*/, apiRequest("POST", "/api/games", {})];
                    case 1:
                        gameResponse = _a.sent();
                        return [4 /*yield*/, gameResponse.json()];
                    case 2:
                        game = _a.sent();
                        return [4 /*yield*/, apiRequest("POST", "/api/games/join", {
                                roomCode: game.roomCode,
                                nickname: nickname.trim(),
                            })];
                    case 3:
                        joinResponse = _a.sent();
                        return [4 /*yield*/, joinResponse.json()];
                    case 4:
                        joinResult = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, joinResult), { roomCode: game.roomCode })];
                }
            });
        }); },
        onSuccess: function (data) {
            // Store player info in localStorage
            localStorage.setItem("playerId", data.playerId);
            localStorage.setItem("nickname", nickname);
            localStorage.setItem("gameId", data.game.id);
            toast({
                title: "Multiplayer Game Created!",
                description: "Room code: ".concat(data.roomCode, ". Share this with your friend!"),
                variant: "warning",
            });
            navigate("/game/".concat(data.game.id, "?playerId=").concat(data.playerId));
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to create game",
                variant: "destructive",
            });
        },
    });
    var joinGameMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!nickname.trim()) {
                            throw new Error("Please enter a nickname");
                        }
                        if (!roomCode.trim()) {
                            throw new Error("Please enter a room code");
                        }
                        return [4 /*yield*/, apiRequest("POST", "/api/games/join", {
                                roomCode: roomCode.trim().toUpperCase(),
                                nickname: nickname.trim(),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); },
        onSuccess: function (data) {
            // Store player info in localStorage
            localStorage.setItem("playerId", data.playerId);
            localStorage.setItem("nickname", nickname);
            localStorage.setItem("gameId", data.game.id);
            toast({
                title: "Joined Game!",
                description: "Welcome to the game, ".concat(nickname, "!"),
            });
            navigate("/game/".concat(data.game.id, "?playerId=").concat(data.playerId));
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to join game",
                variant: "destructive",
            });
        },
    });
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src={logoImage} alt="It's About Time!!" className="mx-auto h-32 w-auto" data-testid="game-logo"/>
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
                <TabsTrigger value="single" className="relative text-muted-foreground data-[state=active]:bg-[#0c8557] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-[#0c8557]/10">
                  Single Player
                </TabsTrigger>
                <TabsTrigger value="create" className="relative text-muted-foreground data-[state=active]:bg-[#0c8557] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-[#0c8557]/10">
                  Create Room
                </TabsTrigger>
                <TabsTrigger value="join" className="relative text-muted-foreground data-[state=active]:bg-[#0c8557] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-[#0c8557]/10">
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
                  <Button onClick={function () { return createSinglePlayerMutation.mutate(); }} disabled={createSinglePlayerMutation.isPending} className="w-full bg-[#0c8557] hover:bg-[#0c8557]/90" data-testid="button-single-player">
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
                    <label htmlFor="create-nickname" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Nickname
                    </label>
                    <Input id="create-nickname" placeholder="Enter your nickname" value={nickname} onChange={function (e) { return setNickname(e.target.value); }} data-testid="input-nickname-create" className="border-blue-200 focus:border-blue-500"/>
                  </div>
                  <p className="text-sm text-blue-600">
                    Create a new game and get a room code to share with a
                    friend.
                  </p>
                  <Button onClick={function () { return createMultiplayerGameMutation.mutate(); }} disabled={createMultiplayerGameMutation.isPending ||
            !nickname.trim()} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-create-game">
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
                    <label htmlFor="join-nickname" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Nickname
                    </label>
                    <Input id="join-nickname" placeholder="Enter your nickname" value={nickname} onChange={function (e) { return setNickname(e.target.value); }} data-testid="input-nickname-join" className="border-purple-200 focus:border-purple-500"/>
                  </div>
                  <div>
                    <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Room Code
                    </label>
                    <Input id="roomCode" placeholder="Enter room code" value={roomCode} onChange={function (e) {
            return setRoomCode(e.target.value.toUpperCase());
        }} data-testid="input-room-code" className="border-purple-200 focus:border-purple-500 font-mono text-center"/>
                  </div>
                  <Button onClick={function () { return joinGameMutation.mutate(); }} disabled={joinGameMutation.isPending ||
            !nickname.trim() ||
            !roomCode.trim()} className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-join-game">
                    {joinGameMutation.isPending ? "Joining..." : "Join Game"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>);
}
