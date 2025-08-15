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
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "@/components/GameHeader";
import Timeline from "@/components/Timeline";
import CurrentCard from "@/components/CurrentCard";
import GameStats from "@/components/GameStats";
import RecentActivity from "@/components/RecentActivity";
import FeedbackModal from "@/components/FeedbackModal";
export default function Game() {
    var _this = this;
    var _a, _b;
    var _c = useRoute("/game/:gameId?"), match = _c[0], params = _c[1];
    var _d = useLocation(), navigate = _d[1];
    var urlParams = new URLSearchParams(window.location.search);
    var playerId = urlParams.get("playerId") || localStorage.getItem("playerId");
    var nickname = localStorage.getItem("nickname");
    var toast = useToast().toast;
    var _e = useState((params === null || params === void 0 ? void 0 : params.gameId) || null), gameId = _e[0], setGameId = _e[1];
    var _f = useState(!!(params === null || params === void 0 ? void 0 : params.gameId) && !!playerId), isMultiplayer = _f[0], setIsMultiplayer = _f[1];
    var _g = useState({
        isVisible: false,
        isCorrect: false,
        message: "",
    }), feedbackData = _g[0], setFeedbackData = _g[1];
    var _h = useState(null), selectedCardId = _h[0], setSelectedCardId = _h[1];
    var _j = useState(false), showPlayerJoinedNotification = _j[0], setShowPlayerJoinedNotification = _j[1];
    var _k = useState(""), joinedPlayerName = _k[0], setJoinedPlayerName = _k[1];
    var _l = useState(""), opponentNickname = _l[0], setOpponentNickname = _l[1];
    var _m = useState(null), playerColor = _m[0], setPlayerColor = _m[1];
    var _o = useState(new Set()), notifiedPlayerIds = _o[0], setNotifiedPlayerIds = _o[1];
    var _p = useState(function () {
        // Check localStorage to see if user has dismissed the card before
        return localStorage.getItem("dismissedHowToPlay") !== "true";
    }), showHowToPlay = _p[0], setShowHowToPlay = _p[1];
    var _q = useState(false), showVictoryModal = _q[0], setShowVictoryModal = _q[1];
    var _r = useState(false), justWon = _r[0], setJustWon = _r[1];
    var _s = useState({
        isVisible: false,
        requestingPlayerId: "",
        requestingPlayerName: "",
    }), newGameRequest = _s[0], setNewGameRequest = _s[1];
    // Create a new game on component mount
    var createGameMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var isSinglePlayerGame, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isSinglePlayerGame = !playerId;
                        return [4 /*yield*/, apiRequest("POST", "/api/games", {
                                singlePlayer: isSinglePlayerGame,
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function (game) { return __awaiter(_this, void 0, void 0, function () {
            var isSinglePlayerGame, joinResponse, joinResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isSinglePlayerGame = !playerId;
                        if (isSinglePlayerGame) {
                            setGameId(game.id);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, apiRequest("POST", "/api/games/join", {
                                roomCode: game.roomCode,
                                nickname: (nickname || "Player").toString(),
                            })];
                    case 2:
                        joinResponse = _a.sent();
                        return [4 /*yield*/, joinResponse.json()];
                    case 3:
                        joinResult = _a.sent();
                        // Persist new player identity and game id
                        localStorage.setItem("playerId", joinResult.playerId);
                        if (nickname) {
                            localStorage.setItem("nickname", nickname);
                        }
                        localStorage.setItem("gameId", joinResult.game.id);
                        // Navigate to new game URL so the Game ID in the route updates
                        navigate("/game/".concat(joinResult.game.id, "?playerId=").concat(joinResult.playerId));
                        setGameId(joinResult.game.id);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        // Fallback: if join fails, at least show the created game
                        setGameId(game.id);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); },
    });
    // Get game state
    var _t = useQuery({
        queryKey: ["/api/games", gameId],
        enabled: !!gameId,
    }), gameState = _t.data, isLoading = _t.isLoading;
    // Update multiplayer status when game state loads
    useEffect(function () {
        if (gameState === null || gameState === void 0 ? void 0 : gameState.game) {
            var hasRoomCode = !!gameState.game.roomCode;
            var hasPlayerId = !!playerId;
            setIsMultiplayer(hasRoomCode && hasPlayerId);
            // Fetch opponent nickname for multiplayer games
            if (hasRoomCode && hasPlayerId) {
                var opponentId = playerId === gameState.game.player1Id
                    ? gameState.game.player2Id
                    : gameState.game.player1Id;
                if (opponentId) {
                    fetch("/api/players/".concat(opponentId))
                        .then(function (response) { return response.json(); })
                        .then(function (player) {
                        setOpponentNickname(player.nickname || "Opponent");
                    })
                        .catch(function () {
                        setOpponentNickname("Opponent");
                    });
                }
                else {
                    // If no opponent yet, clear the nickname
                    setOpponentNickname("");
                }
                // Fetch current player's color
                if (playerId) {
                    fetch("/api/players/".concat(playerId))
                        .then(function (response) { return response.json(); })
                        .then(function (player) {
                        if (player.color) {
                            setPlayerColor(player.color);
                        }
                    });
                }
            }
            else {
                // Clear opponent nickname for single player games
                setOpponentNickname("");
                // For single player, get color from local storage or use default
                setPlayerColor(localStorage.getItem("playerColor") || "blue");
            }
        }
    }, [gameState, playerId]);
    // WebSocket connection for multiplayer
    var _u = useWebSocket({
        gameId: isMultiplayer ? gameId || undefined : undefined,
        playerId: isMultiplayer ? playerId || undefined : undefined,
        onMessage: function (message) {
            console.log("Received WebSocket message:", message);
            // Handle player joined notification
            if (message.type === "player_joined" &&
                message.data.playerId !== playerId) {
                // Only show notification if we haven't already notified about this player
                if (!notifiedPlayerIds.has(message.data.playerId)) {
                    // Mark this player as notified
                    setNotifiedPlayerIds(function (prev) {
                        return new Set(prev).add(message.data.playerId);
                    });
                    // Fetch the player's nickname from the server
                    fetch("/api/players/".concat(message.data.playerId))
                        .then(function (response) { return response.json(); })
                        .then(function (player) {
                        var playerName = player.nickname || "A friend";
                        setJoinedPlayerName(playerName);
                        setOpponentNickname(playerName); // Also update the header
                        setShowPlayerJoinedNotification(true);
                        setTimeout(function () { return setShowPlayerJoinedNotification(false); }, 4000);
                    })
                        .catch(function () {
                        var fallbackName = "A friend";
                        setJoinedPlayerName(fallbackName);
                        setOpponentNickname(fallbackName); // Also update the header
                        setShowPlayerJoinedNotification(true);
                        setTimeout(function () { return setShowPlayerJoinedNotification(false); }, 4000);
                    });
                }
                else {
                    // Player already notified, just update opponent nickname silently
                    fetch("/api/players/".concat(message.data.playerId))
                        .then(function (response) { return response.json(); })
                        .then(function (player) {
                        var playerName = player.nickname || "A friend";
                        setOpponentNickname(playerName);
                    })
                        .catch(function () {
                        setOpponentNickname("A friend");
                    });
                }
            }
            // Handle game completion
            if (message.type === "game_completed") {
                setShowVictoryModal(true);
                // Trigger confetti for any game completion (winner or loser)
                setTimeout(function () {
                    var duration = 3000;
                    var end = Date.now() + duration;
                    (function frame() {
                        // Create confetti
                        if (typeof window !== "undefined" && window.confetti) {
                            window.confetti({
                                particleCount: Math.floor(Math.random() * 50) + 50,
                                angle: Math.random() * 360,
                                spread: Math.random() * 50 + 50,
                                origin: {
                                    x: Math.random(),
                                    y: Math.random() - 0.2,
                                },
                            });
                        }
                        if (Date.now() < end) {
                            requestAnimationFrame(frame);
                        }
                    })();
                }, 500);
                // Refresh game state to show final scores
                queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
            }
            // Handle real-time updates here
            if (message.type === "move_made") {
                // Show toast for opponent's move
                if (message.data.playerId !== playerId) {
                    // Get opponent's nickname and event details to show in toast
                    console.log("Fetching data for toast:", {
                        playerId: message.data.playerId,
                        eventId: message.data.eventId,
                    });
                    Promise.all([
                        fetch("/api/players/".concat(message.data.playerId)).then(function (r) {
                            console.log("Player response status:", r.status);
                            return r.json();
                        }),
                        fetch("/api/events/".concat(message.data.eventId)).then(function (r) {
                            console.log("Event response status:", r.status);
                            return r.json();
                        }),
                    ])
                        .then(function (_a) {
                        var player = _a[0], event = _a[1];
                        console.log("Fetched data:", { player: player, event: event });
                        var opponentName = player.nickname || "Opponent";
                        var eventTitle = event.title || "Unknown Event";
                        var eventYear = event.year || "Unknown Year";
                        // Format year for display (B.C. for negative years)
                        var displayYear = typeof eventYear === "number" && eventYear < 0
                            ? "".concat(Math.abs(eventYear), " B.C.")
                            : eventYear;
                        var status = message.data.isCorrect
                            ? "is correct"
                            : "is incorrect";
                        var toastTitle = "".concat(opponentName, " ").concat(status, "!");
                        var toastDescription = message.data.isCorrect
                            ? "".concat(eventTitle, " happened in year ").concat(displayYear, ".")
                            : "".concat(eventTitle, " was placed incorrectly.");
                        toast({
                            title: toastTitle,
                            description: toastDescription,
                            variant: message.data.isCorrect ? "success" : "destructive",
                        });
                    })
                        .catch(function (error) {
                        console.error("Error fetching toast data:", error);
                        // Fallback toast if API calls fail
                        var status = message.data.isCorrect
                            ? "is correct"
                            : "is incorrect";
                        toast({
                            title: "Opponent ".concat(status, "!"),
                            description: "Your opponent just made a move.",
                            variant: message.data.isCorrect ? "success" : "destructive",
                        });
                    });
                }
                // Refresh game state when opponent makes a move
                queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
            }
            // Handle new game request
            if (message.type === "new_game_request") {
                setNewGameRequest({
                    isVisible: true,
                    requestingPlayerId: message.data.requestingPlayerId,
                    requestingPlayerName: message.data.requestingPlayerName,
                });
            }
            // Handle new game accepted
            if (message.type === "new_game_accepted") {
                // Navigate to the new game
                navigate("/game/".concat(message.data.newGameId, "?playerId=").concat(playerId));
                setGameId(message.data.newGameId);
                toast({
                    title: "New Game Started!",
                    description: "Both players have accepted the new game.",
                    variant: "success",
                });
            }
            // Handle new game rejected
            if (message.type === "new_game_rejected") {
                toast({
                    title: "New Game Rejected",
                    description: "Your opponent declined to start a new game.",
                    variant: "destructive",
                });
            }
        },
    }), isConnected = _u.isConnected, sendMessage = _u.sendMessage;
    // Place event mutation
    var placeEventMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var body, response;
            var eventId = _b.eventId, position = _b.position;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = isMultiplayer ? { position: position, playerId: playerId } : { position: position };
                        return [4 /*yield*/, apiRequest("POST", "/api/games/".concat(gameId, "/place/").concat(eventId), body)];
                    case 1:
                        response = _c.sent();
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _c.sent()];
                }
            });
        }); },
        onSuccess: function (result) {
            setFeedbackData({
                isVisible: true,
                isCorrect: result.isCorrect,
                message: result.message,
            });
            // Note: WebSocket message is now sent by the server automatically
            // Refetch game state
            queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
            // Check for victory after correct placement
            if (result.isCorrect) {
                setJustWon(true);
            }
        },
    });
    useEffect(function () {
        // Only create a single-player game if we don't have a gameId from URL
        if (!gameId && !isMultiplayer) {
            createGameMutation.mutate();
        }
    }, []);
    var handlePlaceEvent = function (eventId, position) {
        console.log("handlePlaceEvent called:", { eventId: eventId, position: position });
        // For multiplayer: check if it's the player's turn
        if (isMultiplayer && (gameState === null || gameState === void 0 ? void 0 : gameState.game)) {
            var isPlayer1 = playerId === gameState.game.player1Id;
            var isPlayer2 = playerId === gameState.game.player2Id;
            var expectedTurn = isPlayer1 ? "player1" : "player2";
            if (gameState.game.currentTurn !== expectedTurn) {
                setFeedbackData({
                    isVisible: true,
                    isCorrect: false,
                    message: "It's not your turn! Wait for the other player to make their move.",
                });
                return;
            }
        }
        placeEventMutation.mutate({ eventId: eventId, position: position });
        setSelectedCardId(null); // Clear selection after placing
    };
    var handleCloseFeedback = function () {
        setFeedbackData(function (prev) { return (__assign(__assign({}, prev), { isVisible: false })); });
    };
    var handleAcceptNewGame = function () {
        if (gameId && playerId) {
            var message = {
                type: "new_game_response",
                data: {
                    gameId: gameId,
                    respondingPlayerId: playerId,
                    accepted: true,
                },
            };
            sendMessage(message);
        }
        setNewGameRequest({ isVisible: false, requestingPlayerId: "", requestingPlayerName: "" });
    };
    var handleRejectNewGame = function () {
        if (gameId && playerId) {
            sendMessage({
                type: "new_game_response",
                data: {
                    gameId: gameId,
                    respondingPlayerId: playerId,
                    accepted: false,
                },
            });
        }
        setNewGameRequest({ isVisible: false, requestingPlayerId: "", requestingPlayerName: "" });
    };
    var handleNewGame = function () {
        if (isMultiplayer && gameId && playerId && nickname) {
            // Send new game request to opponent via WebSocket
            sendMessage({
                type: "new_game_request",
                data: {
                    gameId: gameId,
                    requestingPlayerId: playerId,
                    requestingPlayerName: nickname,
                },
            });
            toast({
                title: "New Game Request Sent",
                description: "Waiting for your opponent to accept...",
                variant: "default",
            });
        }
        else {
            // Single player or no multiplayer context - create new game immediately
            setGameId(null);
            setSelectedCardId(null);
            setFeedbackData({ isVisible: false, isCorrect: false, message: "" });
            setShowVictoryModal(false);
            setJustWon(false);
            createGameMutation.mutate();
        }
    };
    var handleSelectCard = function (cardId) {
        console.log("Game: Card selected:", cardId);
        setSelectedCardId(cardId);
    };
    var handleTargetChange = function (newTarget) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!gameId) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, apiRequest("PATCH", "/api/games/".concat(gameId, "/settings"), {
                            targetScore: newTarget,
                        })];
                case 2:
                    _a.sent();
                    queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Failed to update target score:", error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Check for game completion and show victory modal
    useEffect(function () {
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.game) && gameState.game.gameStatus === "completed") {
            // For single-player games, check if we just won
            if (!isMultiplayer && justWon) {
                setShowVictoryModal(true);
                setJustWon(false);
                // Trigger confetti for single-player wins
                setTimeout(function () {
                    var duration = 3000;
                    var end = Date.now() + duration;
                    (function frame() {
                        // Create confetti
                        if (typeof window !== "undefined" && window.confetti) {
                            window.confetti({
                                particleCount: Math.floor(Math.random() * 50) + 50,
                                angle: Math.random() * 360,
                                spread: Math.random() * 50 + 50,
                                origin: {
                                    x: Math.random(),
                                    y: Math.random() - 0.2,
                                },
                            });
                        }
                        if (Date.now() < end) {
                            requestAnimationFrame(frame);
                        }
                    })();
                }, 500);
            }
            // For multiplayer games, the confetti is handled by WebSocket 'game_completed' message
        }
    }, [(_a = gameState === null || gameState === void 0 ? void 0 : gameState.game) === null || _a === void 0 ? void 0 : _a.gameStatus, justWon, isMultiplayer]);
    var handleDeselectCard = function () {
        console.log("Game: Card deselected");
        setSelectedCardId(null);
    };
    if (isLoading || !gameState) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50" data-testid="game-container">
      <GameHeader gameState={gameState} isMultiplayer={isMultiplayer} currentPlayerId={playerId || undefined} nickname={nickname || undefined} opponentNickname={opponentNickname || undefined} onTargetChange={handleTargetChange} onNewGame={handleNewGame} playerColor={playerColor} setPlayerColor={setPlayerColor}/>

      {/* Turn indicator for multiplayer */}
      {isMultiplayer && gameState.game && (<div className={"border-l-4 p-4 mx-4 mt-4 rounded-r-lg ".concat((function () {
                var isPlayer1 = playerId === gameState.game.player1Id;
                var isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn
                    ? "bg-green-50 border-green-600"
                    : "bg-orange-50 border-orange-600";
            })())}>
          <div className="flex items-start">
            <div className={"w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ".concat((function () {
                var isPlayer1 = playerId === gameState.game.player1Id;
                var isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn ? "bg-green-600" : "bg-orange-600";
            })())}>
              <span className="text-white text-xs font-bold">
                {(function () {
                var isPlayer1 = playerId === gameState.game.player1Id;
                var isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn ? "▶" : "⏸";
            })()}
              </span>
            </div>
            <div>
              <h3 className={"text-sm font-medium ".concat((function () {
                var isPlayer1 = playerId === gameState.game.player1Id;
                var isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn ? "text-green-800" : "text-orange-800";
            })())}>
                {(function () {
                var isPlayer1 = playerId === gameState.game.player1Id;
                var isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn ? "Your Turn!" : "Opponent's Turn";
            })()}
              </h3>
              <p className={"text-sm ".concat((function () {
                var isPlayer1 = playerId === gameState.game.player1Id;
                var isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn ? "text-green-700" : "text-orange-700";
            })())}>
                {(function () {
                var isPlayer1 = playerId === gameState.game.player1Id;
                var isMyTurn = (isPlayer1 && gameState.game.currentTurn === "player1") ||
                    (!isPlayer1 && gameState.game.currentTurn === "player2");
                return isMyTurn
                    ? "Click the current card to select it, then click a drop zone to place it chronologically."
                    : "Please wait for the other player to make their move.";
            })()}
              </p>
            </div>
          </div>
        </div>)}

      {/* Instructions for single player */}
      {!isMultiplayer && showHowToPlay && (<div className="bg-blue-50 border-l-4 border-blue-600 p-4 mx-4 mt-4 rounded-r-lg relative">
          <button onClick={function () {
                setShowHowToPlay(false);
                localStorage.setItem("dismissedHowToPlay", "true");
            }} className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 transition-colors" data-testid="close-how-to-play" aria-label="Close instructions">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-xs font-bold">?</span>
            </div>
            <div className="pr-8">
              <h3 className="text-sm font-medium text-blue-800">How to Play</h3>
              <p className="text-sm text-blue-700">
                <strong>Step 1:</strong> Click the purple "Current Card" below
                to select it.
                <strong>Step 2:</strong> Click a drop zone in your timeline
                above to place it chronologically. Choose{" "}
                <strong>"Before"</strong> the first card or{" "}
                <strong>"After"</strong> any existing card. Get 10 cards
                correctly placed to win!
              </p>
            </div>
          </div>
        </div>)}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Timeline gameState={gameState} onPlaceEvent={handlePlaceEvent} isPlacing={placeEventMutation.isPending} selectedCardId={selectedCardId} currentPlayerId={playerId || undefined} playerColor={playerColor}/>
            <CurrentCard gameState={gameState} onPlaceEvent={handlePlaceEvent} isPlacing={placeEventMutation.isPending} selectedCardId={selectedCardId} onSelectCard={handleSelectCard} onDeselectCard={handleDeselectCard} isMultiplayer={isMultiplayer} currentPlayerId={playerId || undefined}/>
          </div>

          <div className="lg:col-span-1">
            <GameStats gameState={gameState} currentPlayerId={playerId || undefined}/>
            <RecentActivity gameState={gameState}/>
          </div>
        </div>
      </main>

      <FeedbackModal isVisible={feedbackData.isVisible} isCorrect={feedbackData.isCorrect} message={feedbackData.message} onClose={handleCloseFeedback}/>

      {/* Victory Modal */}
      {showVictoryModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11h14V7l-7-5zM8 15.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd"/>
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
              </div>
              {isMultiplayer && (gameState === null || gameState === void 0 ? void 0 : gameState.game) ? (<>
                  {gameState.game.winnerPlayerId === playerId ? (<>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        🎉 You Won! 🎉
                      </h2>
                      <p className="text-lg text-gray-600 mb-2">
                        Congratulations! You completed your timeline first!
                      </p>
                      <p className="text-sm text-gray-500">
                        Final Score: You{" "}
                        {gameState.game.player1Id === playerId
                        ? gameState.game.player1Score
                        : gameState.game.player2Score}{" "}
                        -{" "}
                        {gameState.game.player1Id === playerId
                        ? gameState.game.player2Score
                        : gameState.game.player1Score}{" "}
                        {opponentNickname || "Opponent"}
                      </p>
                    </>) : (<>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        🎊 Game Complete! 🎊
                      </h2>
                      <p className="text-lg text-gray-600 mb-2">
                        {opponentNickname || "Your opponent"} won this round!
                      </p>
                      <p className="text-sm text-gray-500">
                        Final Score: {opponentNickname || "Opponent"}{" "}
                        {gameState.game.player1Id === playerId
                        ? gameState.game.player2Score
                        : gameState.game.player1Score}{" "}
                        -{" "}
                        {gameState.game.player1Id === playerId
                        ? gameState.game.player1Score
                        : gameState.game.player2Score}{" "}
                        You
                      </p>
                    </>)}
                </>) : (<>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    🎉 Congratulations! 🎉
                  </h2>
                  <p className="text-lg text-gray-600 mb-2">
                    You've completed your historical timeline!
                  </p>
                  <p className="text-sm text-gray-500">
                    You successfully placed {((_b = gameState === null || gameState === void 0 ? void 0 : gameState.game) === null || _b === void 0 ? void 0 : _b.targetScore) || 10}{" "}
                    events in chronological order!
                  </p>
                </>)}
            </div>

            <div className="space-y-3">
              <button onClick={handleNewGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors" data-testid="play-again-button">
                🔄 Play Again
              </button>
              <button onClick={function () { return setShowVictoryModal(false); }} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors" data-testid="close-victory-modal">
                ⏳️ Review Timeline
              </button>
            </div>
          </div>
        </div>)}

      {/* New Game Request Modal */}
      {newGameRequest.isVisible && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                New Game Request
              </h2>
              <p className="text-gray-600">
                <span className="font-medium">{newGameRequest.requestingPlayerName}</span>{" "}
                wants to start a new game. Would you like to join?
              </p>
            </div>

            <div className="flex space-x-3">
              <button onClick={handleAcceptNewGame} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors" data-testid="accept-new-game-button">
                Accept
              </button>
              <button onClick={handleRejectNewGame} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors" data-testid="reject-new-game-button">
                Decline
              </button>
            </div>
          </div>
        </div>)}

      {/* Player Joined Notification */}
      {showPlayerJoinedNotification && (<div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-4 duration-300" data-testid="player-joined-notification">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">👋</span>
            </div>
            <div>
              <p className="font-semibold">Player Joined!</p>
              <p className="text-sm text-green-100">
                {joinedPlayerName} has joined the game
              </p>
            </div>
          </div>
        </div>)}
    </div>);
}
