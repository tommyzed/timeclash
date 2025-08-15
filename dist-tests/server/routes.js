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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { insertPlayerSchema, } from "@shared/schema";
import { z } from "zod";
// WebSocket connection management
var gameRooms = new Map();
var playerConnections = new Map();
function broadcastToGame(gameId, message) {
    var connections = gameRooms.get(gameId);
    if (connections) {
        connections.forEach(function (ws) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        });
    }
}
export function registerRoutes(app, storage) {
    return __awaiter(this, void 0, void 0, function () {
        var placeEventSchema, httpServer, wss;
        var _this = this;
        return __generator(this, function (_a) {
            // Get all historical events
            app.get("/api/events", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var events, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage.getAllHistoricalEvents()];
                        case 1:
                            events = _a.sent();
                            res.json(events);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            res.status(500).json({ message: "Failed to fetch events" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get a specific historical event by ID
            app.get("/api/events/:eventId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var eventId, event_1, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            eventId = req.params.eventId;
                            return [4 /*yield*/, storage.getHistoricalEvent(eventId)];
                        case 1:
                            event_1 = _a.sent();
                            if (!event_1) {
                                return [2 /*return*/, res.status(404).json({ message: "Event not found" })];
                            }
                            res.json(event_1);
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            console.error("Get event error:", error_2);
                            res.status(500).json({ message: "Failed to get event" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Create a new game (single player or with room code for multiplayer)
            app.post("/api/games", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, roomCode, singlePlayer, game, currentEvent, generatedRoomCode, game, currentEvent, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 11, , 12]);
                            _a = req.body, roomCode = _a.roomCode, singlePlayer = _a.singlePlayer;
                            if (!singlePlayer) return [3 /*break*/, 5];
                            return [4 /*yield*/, storage.createGame()];
                        case 1:
                            game = _b.sent();
                            return [4 /*yield*/, storage.getRandomHistoricalEvent(game.placedEventIds)];
                        case 2:
                            currentEvent = _b.sent();
                            if (!currentEvent) return [3 /*break*/, 4];
                            return [4 /*yield*/, storage.updateGame(game.id, {
                                    currentEventId: currentEvent.id,
                                })];
                        case 3:
                            _b.sent();
                            game.currentEventId = currentEvent.id;
                            _b.label = 4;
                        case 4:
                            res.json(game);
                            return [3 /*break*/, 10];
                        case 5:
                            generatedRoomCode = roomCode || Math.random().toString(36).substring(2, 8).toUpperCase();
                            return [4 /*yield*/, storage.createGame(generatedRoomCode)];
                        case 6:
                            game = _b.sent();
                            return [4 /*yield*/, storage.getRandomHistoricalEvent(game.placedEventIds)];
                        case 7:
                            currentEvent = _b.sent();
                            if (!currentEvent) return [3 /*break*/, 9];
                            return [4 /*yield*/, storage.updateGame(game.id, {
                                    currentEventId: currentEvent.id,
                                })];
                        case 8:
                            _b.sent();
                            game.currentEventId = currentEvent.id;
                            _b.label = 9;
                        case 9:
                            res.json(game);
                            _b.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            error_3 = _b.sent();
                            console.error("Create game error:", error_3);
                            res.status(500).json({ message: "Failed to create game" });
                            return [3 /*break*/, 12];
                        case 12: return [2 /*return*/];
                    }
                });
            }); });
            // Join a game by room code
            app.post("/api/games/join", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, roomCode, nickname, game, player, updatedGame, error_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            _a = req.body, roomCode = _a.roomCode, nickname = _a.nickname;
                            if (!roomCode || !nickname) {
                                return [2 /*return*/, res
                                        .status(400)
                                        .json({ message: "Room code and nickname are required" })];
                            }
                            return [4 /*yield*/, storage.getGameByRoomCode(roomCode)];
                        case 1:
                            game = _b.sent();
                            if (!game) {
                                return [2 /*return*/, res.status(404).json({ message: "Game not found" })];
                            }
                            return [4 /*yield*/, storage.createPlayer({ nickname: nickname })];
                        case 2:
                            player = _b.sent();
                            return [4 /*yield*/, storage.joinGame(game.id, player.id)];
                        case 3:
                            updatedGame = _b.sent();
                            if (!updatedGame) {
                                return [2 /*return*/, res.status(400).json({ message: "Game is full or unavailable" })];
                            }
                            res.json({ game: updatedGame, playerId: player.id });
                            return [3 /*break*/, 5];
                        case 4:
                            error_4 = _b.sent();
                            console.error("Join game error:", error_4);
                            res.status(500).json({ message: "Failed to join game" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Create a player
            app.post("/api/players", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var playerData, player, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            playerData = insertPlayerSchema.parse(req.body);
                            return [4 /*yield*/, storage.createPlayer(playerData)];
                        case 1:
                            player = _a.sent();
                            res.json(player);
                            return [3 /*break*/, 3];
                        case 2:
                            error_5 = _a.sent();
                            console.error("Create player error:", error_5);
                            res.status(500).json({ message: "Failed to create player" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get a specific player by ID
            app.get("/api/players/:playerId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var playerId, player, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            playerId = req.params.playerId;
                            return [4 /*yield*/, storage.getPlayer(playerId)];
                        case 1:
                            player = _a.sent();
                            if (!player) {
                                return [2 /*return*/, res.status(404).json({ message: "Player not found" })];
                            }
                            res.json(player);
                            return [3 /*break*/, 3];
                        case 2:
                            error_6 = _a.sent();
                            console.error("Get player error:", error_6);
                            res.status(500).json({ message: "Failed to get player" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Update player color
            app.post("/api/players/:playerId/color", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var playerId, color, updatedPlayer, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            playerId = req.params.playerId;
                            color = req.body.color;
                            if (!color) {
                                return [2 /*return*/, res.status(400).json({ message: "Color is required" })];
                            }
                            return [4 /*yield*/, storage.updatePlayerColor(playerId, color)];
                        case 1:
                            updatedPlayer = _a.sent();
                            if (!updatedPlayer) {
                                return [2 /*return*/, res.status(404).json({ message: "Player not found" })];
                            }
                            res.json(updatedPlayer);
                            return [3 /*break*/, 3];
                        case 2:
                            error_7 = _a.sent();
                            console.error("Update player color error:", error_7);
                            res.status(500).json({ message: "Failed to update player color" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get game state
            app.get("/api/games/:gameId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var gameId, game_1, allMoves, placedEvents, _loop_1, i, currentEvent, _a, moves, recentMoves, _i, _b, move, event_2, playerName, player, error_8, playerStats, player1IncorrectCount, player2IncorrectCount, player1IncorrectCount, gameState, error_9;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 18, , 19]);
                            gameId = req.params.gameId;
                            return [4 /*yield*/, storage.getGame(gameId)];
                        case 1:
                            game_1 = _c.sent();
                            if (!game_1) {
                                return [2 /*return*/, res.status(404).json({ message: "Game not found" })];
                            }
                            return [4 /*yield*/, storage.getGameMoves(gameId)];
                        case 2:
                            allMoves = _c.sent();
                            placedEvents = [];
                            _loop_1 = function (i) {
                                var eventId, event_3, placementMove, placedByPlayerName, player, error_10;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            eventId = game_1.placedEventIds[i];
                                            return [4 /*yield*/, storage.getHistoricalEvent(eventId)];
                                        case 1:
                                            event_3 = _d.sent();
                                            if (!event_3)
                                                return [2 /*return*/, "continue"];
                                            placementMove = allMoves.find(function (move) { return move.eventId === eventId && move.isCorrect; });
                                            placedByPlayerName = undefined;
                                            if (!(placementMove && placementMove.playerId !== "single-player")) return [3 /*break*/, 5];
                                            _d.label = 2;
                                        case 2:
                                            _d.trys.push([2, 4, , 5]);
                                            return [4 /*yield*/, storage.getPlayer(placementMove.playerId)];
                                        case 3:
                                            player = _d.sent();
                                            placedByPlayerName = player === null || player === void 0 ? void 0 : player.nickname;
                                            return [3 /*break*/, 5];
                                        case 4:
                                            error_10 = _d.sent();
                                            console.error("Error fetching player for placed event:", error_10);
                                            return [3 /*break*/, 5];
                                        case 5:
                                            placedEvents.push({
                                                event: event_3,
                                                position: i,
                                                placedByPlayerId: placementMove === null || placementMove === void 0 ? void 0 : placementMove.playerId,
                                                placedByPlayerName: placedByPlayerName,
                                            });
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            i = 0;
                            _c.label = 3;
                        case 3:
                            if (!(i < game_1.placedEventIds.length)) return [3 /*break*/, 6];
                            return [5 /*yield**/, _loop_1(i)];
                        case 4:
                            _c.sent();
                            _c.label = 5;
                        case 5:
                            i++;
                            return [3 /*break*/, 3];
                        case 6:
                            // Sort placed events by year for proper timeline order
                            placedEvents.sort(function (a, b) { return a.event.year - b.event.year; });
                            if (!game_1.currentEventId) return [3 /*break*/, 8];
                            return [4 /*yield*/, storage.getHistoricalEvent(game_1.currentEventId)];
                        case 7:
                            _a = _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _a = null;
                            _c.label = 9;
                        case 9:
                            currentEvent = _a;
                            moves = allMoves;
                            recentMoves = [];
                            _i = 0, _b = moves.slice(0, 5);
                            _c.label = 10;
                        case 10:
                            if (!(_i < _b.length)) return [3 /*break*/, 17];
                            move = _b[_i];
                            return [4 /*yield*/, storage.getHistoricalEvent(move.eventId)];
                        case 11:
                            event_2 = _c.sent();
                            if (!event_2) return [3 /*break*/, 16];
                            playerName = undefined;
                            if (!(move.playerId !== "single-player")) return [3 /*break*/, 15];
                            _c.label = 12;
                        case 12:
                            _c.trys.push([12, 14, , 15]);
                            return [4 /*yield*/, storage.getPlayer(move.playerId)];
                        case 13:
                            player = _c.sent();
                            playerName = player === null || player === void 0 ? void 0 : player.nickname;
                            return [3 /*break*/, 15];
                        case 14:
                            error_8 = _c.sent();
                            console.error("Error fetching player for recent move:", error_8);
                            return [3 /*break*/, 15];
                        case 15:
                            recentMoves.push(__assign(__assign({}, move), { event: event_2, playerName: playerName }));
                            _c.label = 16;
                        case 16:
                            _i++;
                            return [3 /*break*/, 10];
                        case 17:
                            playerStats = void 0;
                            if (game_1.roomCode) {
                                player1IncorrectCount = moves.filter(function (move) { return move.playerId === game_1.player1Id && !move.isCorrect; }).length;
                                player2IncorrectCount = moves.filter(function (move) { return move.playerId === game_1.player2Id && !move.isCorrect; }).length;
                                playerStats = {
                                    player1IncorrectCount: player1IncorrectCount,
                                    player2IncorrectCount: player2IncorrectCount,
                                };
                            }
                            else {
                                player1IncorrectCount = moves.filter(function (move) { return !move.isCorrect; }).length;
                                playerStats = {
                                    player1IncorrectCount: player1IncorrectCount,
                                    player2IncorrectCount: 0,
                                };
                            }
                            gameState = {
                                game: game_1,
                                placedEvents: placedEvents,
                                currentEvent: currentEvent,
                                recentMoves: recentMoves,
                                playerStats: playerStats,
                            };
                            res.json(gameState);
                            return [3 /*break*/, 19];
                        case 18:
                            error_9 = _c.sent();
                            console.error("Fetch game state error:", error_9);
                            res.status(500).json({ message: "Failed to fetch game state" });
                            return [3 /*break*/, 19];
                        case 19: return [2 /*return*/];
                    }
                });
            }); });
            placeEventSchema = z.object({
                position: z.number().min(0),
            });
            app.post("/api/games/:gameId/place/:eventId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, gameId, eventId, position, game, event_4, timelineEvents, _i, _b, placedEventId, placedEvent, isCorrect, prevEvent, nextEvent, playerId, isPlayer1, isPlayer2, expectedTurn, newPlacedEventIds, updateData, newScore, newScore, newAttemptedEventIds, nextEvent, updateData, newAttemptedEventIds, nextEvent, displayYear, error_11;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 16, , 17]);
                            _a = req.params, gameId = _a.gameId, eventId = _a.eventId;
                            position = placeEventSchema.parse(req.body).position;
                            return [4 /*yield*/, storage.getGame(gameId)];
                        case 1:
                            game = _c.sent();
                            if (!game) {
                                return [2 /*return*/, res.status(404).json({ message: "Game not found" })];
                            }
                            return [4 /*yield*/, storage.getHistoricalEvent(eventId)];
                        case 2:
                            event_4 = _c.sent();
                            if (!event_4) {
                                return [2 /*return*/, res.status(404).json({ message: "Event not found" })];
                            }
                            timelineEvents = [];
                            _i = 0, _b = game.placedEventIds;
                            _c.label = 3;
                        case 3:
                            if (!(_i < _b.length)) return [3 /*break*/, 6];
                            placedEventId = _b[_i];
                            return [4 /*yield*/, storage.getHistoricalEvent(placedEventId)];
                        case 4:
                            placedEvent = _c.sent();
                            if (placedEvent) {
                                timelineEvents.push(placedEvent);
                            }
                            _c.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 3];
                        case 6:
                            timelineEvents.sort(function (a, b) { return a.year - b.year; });
                            isCorrect = false;
                            if (position === 0) {
                                // Placing at the beginning
                                isCorrect = event_4.year <= timelineEvents[0].year;
                            }
                            else if (position >= timelineEvents.length) {
                                // Placing at the end
                                isCorrect =
                                    event_4.year >= timelineEvents[timelineEvents.length - 1].year;
                            }
                            else {
                                prevEvent = timelineEvents[position - 1];
                                nextEvent = timelineEvents[position];
                                isCorrect =
                                    event_4.year >= prevEvent.year && event_4.year <= nextEvent.year;
                            }
                            playerId = req.body.playerId;
                            // For multiplayer games, ensure playerId is provided and it's their turn
                            if (game.roomCode) {
                                if (!playerId) {
                                    return [2 /*return*/, res
                                            .status(400)
                                            .json({ message: "Player ID required for multiplayer" })];
                                }
                                isPlayer1 = playerId === game.player1Id;
                                isPlayer2 = playerId === game.player2Id;
                                if (!isPlayer1 && !isPlayer2) {
                                    return [2 /*return*/, res
                                            .status(403)
                                            .json({ message: "You are not a player in this game" })];
                                }
                                expectedTurn = isPlayer1 ? "player1" : "player2";
                                if (game.currentTurn !== expectedTurn) {
                                    return [2 /*return*/, res.status(403).json({ message: "It's not your turn" })];
                                }
                            }
                            return [4 /*yield*/, storage.createGameMove({
                                    gameId: gameId,
                                    playerId: playerId || "single-player",
                                    eventId: eventId,
                                    placedPosition: position,
                                    isCorrect: isCorrect,
                                })];
                        case 7:
                            _c.sent();
                            if (!isCorrect) return [3 /*break*/, 12];
                            newPlacedEventIds = __spreadArray([], game.placedEventIds, true);
                            newPlacedEventIds.splice(position, 0, eventId);
                            updateData = {
                                placedEventIds: newPlacedEventIds,
                            };
                            if (game.roomCode && playerId) {
                                // Multiplayer game - update specific player score
                                if (playerId === game.player1Id) {
                                    updateData.player1Score = game.player1Score + 1;
                                }
                                else if (playerId === game.player2Id) {
                                    updateData.player2Score = game.player2Score + 1;
                                }
                                // Switch turns after correct move
                                updateData.currentTurn =
                                    game.currentTurn === "player1" ? "player2" : "player1";
                                newScore = playerId === game.player1Id
                                    ? game.player1Score + 1
                                    : game.player2Score + 1;
                                if (newScore >= game.targetScore) {
                                    updateData.gameStatus = "completed";
                                    updateData.winnerPlayerId = playerId;
                                }
                            }
                            else {
                                newScore = game.player1Score + 1;
                                updateData.player1Score = newScore;
                                if (newScore >= game.targetScore) {
                                    updateData.gameStatus = "completed";
                                }
                            }
                            newAttemptedEventIds = __spreadArray(__spreadArray([], (game.attemptedEventIds || []), true), [eventId], false);
                            updateData.attemptedEventIds = newAttemptedEventIds;
                            if (!(updateData.gameStatus !== "completed")) return [3 /*break*/, 9];
                            return [4 /*yield*/, storage.getRandomHistoricalEvent(__spreadArray(__spreadArray([], newPlacedEventIds, true), newAttemptedEventIds, true))];
                        case 8:
                            nextEvent = _c.sent();
                            updateData.currentEventId = (nextEvent === null || nextEvent === void 0 ? void 0 : nextEvent.id) || null;
                            return [3 /*break*/, 10];
                        case 9:
                            updateData.currentEventId = null;
                            _c.label = 10;
                        case 10: return [4 /*yield*/, storage.updateGame(gameId, updateData)];
                        case 11:
                            _c.sent();
                            // If game is completed in multiplayer, broadcast game completion
                            if (updateData.gameStatus === "completed" && game.roomCode) {
                                broadcastToGame(gameId, {
                                    type: "game_completed",
                                    data: {
                                        winnerPlayerId: updateData.winnerPlayerId,
                                        finalScores: {
                                            player1: playerId === game.player1Id ? game.player1Score + 1 : game.player1Score,
                                            player2: playerId === game.player2Id ? game.player2Score + 1 : game.player2Score,
                                        },
                                    },
                                });
                            }
                            return [3 /*break*/, 15];
                        case 12:
                            updateData = {};
                            if (game.roomCode && playerId) {
                                // Switch turns after incorrect move
                                updateData.currentTurn =
                                    game.currentTurn === "player1" ? "player2" : "player1";
                            }
                            newAttemptedEventIds = __spreadArray(__spreadArray([], (game.attemptedEventIds || []), true), [eventId], false);
                            updateData.attemptedEventIds = newAttemptedEventIds;
                            return [4 /*yield*/, storage.getRandomHistoricalEvent(__spreadArray(__spreadArray([], game.placedEventIds, true), newAttemptedEventIds, true))];
                        case 13:
                            nextEvent = _c.sent();
                            updateData.currentEventId = (nextEvent === null || nextEvent === void 0 ? void 0 : nextEvent.id) || null;
                            return [4 /*yield*/, storage.updateGame(gameId, updateData)];
                        case 14:
                            _c.sent();
                            _c.label = 15;
                        case 15:
                            // Broadcast move to other players in multiplayer games
                            if (game.roomCode && playerId) {
                                console.log("Broadcasting move_made message:", {
                                    playerId: playerId,
                                    eventId: eventId,
                                    position: position,
                                    isCorrect: isCorrect,
                                });
                                broadcastToGame(gameId, {
                                    type: "move_made",
                                    data: { playerId: playerId, eventId: eventId, position: position, isCorrect: isCorrect },
                                });
                            }
                            displayYear = event_4.year < 0 ? "".concat(Math.abs(event_4.year), " B.C.") : event_4.year;
                            res.json({
                                isCorrect: isCorrect,
                                message: isCorrect
                                    ? "\"".concat(event_4.title, "\" was in ").concat(displayYear, ".")
                                    : "\"".concat(event_4.title, "\" was in ").concat(displayYear, "."),
                            });
                            return [3 /*break*/, 17];
                        case 16:
                            error_11 = _c.sent();
                            console.error("Place event error:", error_11);
                            res.status(500).json({ message: "Failed to place event" });
                            return [3 /*break*/, 17];
                        case 17: return [2 /*return*/];
                    }
                });
            }); });
            // Update game settings
            app.patch("/api/games/:gameId/settings", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var gameId, targetScore, game, error_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            gameId = req.params.gameId;
                            targetScore = req.body.targetScore;
                            if (!targetScore || targetScore < 5 || targetScore > 15) {
                                return [2 /*return*/, res
                                        .status(400)
                                        .json({ message: "Target score must be between 5 and 15" })];
                            }
                            return [4 /*yield*/, storage.getGame(gameId)];
                        case 1:
                            game = _a.sent();
                            if (!game) {
                                return [2 /*return*/, res.status(404).json({ message: "Game not found" })];
                            }
                            // Only allow settings changes in waiting/playing state, not completed games
                            if (game.gameStatus === "completed") {
                                return [2 /*return*/, res
                                        .status(400)
                                        .json({ message: "Cannot change settings of completed game" })];
                            }
                            return [4 /*yield*/, storage.updateGame(gameId, { targetScore: targetScore })];
                        case 2:
                            _a.sent();
                            res.json({ message: "Settings updated successfully" });
                            return [3 /*break*/, 4];
                        case 3:
                            error_12 = _a.sent();
                            console.error("Update settings error:", error_12);
                            res.status(500).json({ message: "Failed to update settings" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            httpServer = createServer(app);
            wss = new WebSocketServer({ server: httpServer, path: "/ws" });
            wss.on("connection", function (ws, req) {
                console.log("WebSocket connection established");
                ws.on("message", function (data) { return __awaiter(_this, void 0, void 0, function () {
                    var message, _a, _b, gameId, playerId, game, _c, moveGameId, movePlayerId, eventId, position, _d, requestGameId, requestingPlayerId_1, requestingPlayerName_1, currentGame, opponentPlayerId, gameConnections, sentToOpponent_1, _e, responseGameId, respondingPlayerId_1, accepted, responseGame, requesterPlayerId, newRoomCode, newGame_1, currentEvent, firstTurn, responseGameConnections, error_13, responseGameConnections, error_14;
                    var _f, _g, _h;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                _j.trys.push([0, 17, , 18]);
                                message = JSON.parse(data.toString());
                                _a = message.type;
                                switch (_a) {
                                    case "join_game": return [3 /*break*/, 1];
                                    case "make_move": return [3 /*break*/, 3];
                                    case "new_game_request": return [3 /*break*/, 4];
                                    case "new_game_response": return [3 /*break*/, 6];
                                }
                                return [3 /*break*/, 16];
                            case 1:
                                _b = message.data, gameId = _b.gameId, playerId = _b.playerId;
                                console.log("Player joining game:", { gameId: gameId, playerId: playerId });
                                // Add connection to game room
                                if (!gameRooms.has(gameId)) {
                                    gameRooms.set(gameId, new Set());
                                }
                                (_f = gameRooms.get(gameId)) === null || _f === void 0 ? void 0 : _f.add(ws);
                                playerConnections.set(playerId, ws);
                                console.log("Player connections after join:", {
                                    size: playerConnections.size,
                                    keys: Array.from(playerConnections.keys())
                                });
                                // Player may re-join to a different game after a new game is created.
                                // Move this socket to the new game's room by removing it from all rooms first.
                                gameRooms.forEach(function (connections) { return connections.delete(ws); });
                                if (!gameRooms.has(gameId)) {
                                    gameRooms.set(gameId, new Set());
                                }
                                (_g = gameRooms.get(gameId)) === null || _g === void 0 ? void 0 : _g.add(ws);
                                return [4 /*yield*/, storage.getGame(gameId)];
                            case 2:
                                game = _j.sent();
                                broadcastToGame(gameId, {
                                    type: "player_joined",
                                    data: { playerId: playerId, roomCode: (_h = game === null || game === void 0 ? void 0 : game.roomCode) !== null && _h !== void 0 ? _h : "" },
                                });
                                return [3 /*break*/, 16];
                            case 3:
                                _c = message.data, moveGameId = _c.gameId, movePlayerId = _c.playerId, eventId = _c.eventId, position = _c.position;
                                // Broadcast the move to all connected players
                                broadcastToGame(moveGameId, {
                                    type: "move_made",
                                    data: {
                                        playerId: movePlayerId,
                                        eventId: eventId,
                                        position: position,
                                        // This handler only mirrors a client event; correctness is
                                        // determined by HTTP place endpoint. Use false as placeholder.
                                        isCorrect: false,
                                    },
                                });
                                return [3 /*break*/, 16];
                            case 4:
                                _d = message.data, requestGameId = _d.gameId, requestingPlayerId_1 = _d.requestingPlayerId, requestingPlayerName_1 = _d.requestingPlayerName;
                                return [4 /*yield*/, storage.getGame(requestGameId)];
                            case 5:
                                currentGame = _j.sent();
                                if (!currentGame) {
                                    console.log("Game not found:", requestGameId);
                                    ws.send(JSON.stringify({
                                        type: "error",
                                        data: { message: "Game not found" },
                                    }));
                                    return [3 /*break*/, 16];
                                }
                                opponentPlayerId = currentGame.player1Id === requestingPlayerId_1
                                    ? currentGame.player2Id
                                    : currentGame.player1Id;
                                if (!opponentPlayerId) {
                                    console.log("No opponent found");
                                    ws.send(JSON.stringify({
                                        type: "error",
                                        data: { message: "No opponent found" },
                                    }));
                                    return [3 /*break*/, 16];
                                }
                                gameConnections = gameRooms.get(requestGameId);
                                if (gameConnections) {
                                    sentToOpponent_1 = false;
                                    gameConnections.forEach(function (connection) {
                                        if (connection !== ws && connection.readyState === WebSocket.OPEN) {
                                            connection.send(JSON.stringify({
                                                type: "new_game_request",
                                                data: { requestingPlayerId: requestingPlayerId_1, requestingPlayerName: requestingPlayerName_1 },
                                            }));
                                            sentToOpponent_1 = true;
                                        }
                                    });
                                    if (!sentToOpponent_1) {
                                        ws.send(JSON.stringify({
                                            type: "error",
                                            data: { message: "Opponent not connected" },
                                        }));
                                    }
                                }
                                else {
                                    ws.send(JSON.stringify({
                                        type: "error",
                                        data: { message: "Game room not found" },
                                    }));
                                }
                                return [3 /*break*/, 16];
                            case 6:
                                _e = message.data, responseGameId = _e.gameId, respondingPlayerId_1 = _e.respondingPlayerId, accepted = _e.accepted;
                                return [4 /*yield*/, storage.getGame(responseGameId)];
                            case 7:
                                responseGame = _j.sent();
                                if (!responseGame) {
                                    ws.send(JSON.stringify({
                                        type: "error",
                                        data: { message: "Game not found" },
                                    }));
                                    return [3 /*break*/, 16];
                                }
                                requesterPlayerId = responseGame.player1Id === respondingPlayerId_1
                                    ? responseGame.player2Id
                                    : responseGame.player1Id;
                                if (!requesterPlayerId) {
                                    ws.send(JSON.stringify({
                                        type: "error",
                                        data: { message: "Requester not found" },
                                    }));
                                    return [3 /*break*/, 16];
                                }
                                if (!accepted) return [3 /*break*/, 14];
                                _j.label = 8;
                            case 8:
                                _j.trys.push([8, 12, , 13]);
                                newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                                return [4 /*yield*/, storage.createGame(newRoomCode)];
                            case 9:
                                newGame_1 = _j.sent();
                                return [4 /*yield*/, storage.getRandomHistoricalEvent(newGame_1.placedEventIds)];
                            case 10:
                                currentEvent = _j.sent();
                                firstTurn = Math.random() < 0.5 ? "player1" : "player2";
                                // Assign the players to the new game
                                return [4 /*yield*/, storage.updateGame(newGame_1.id, {
                                        player1Id: requesterPlayerId,
                                        player2Id: respondingPlayerId_1,
                                        currentTurn: firstTurn,
                                        currentEventId: currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.id,
                                        gameStatus: "playing"
                                    })];
                            case 11:
                                // Assign the players to the new game
                                _j.sent();
                                responseGameConnections = gameRooms.get(responseGameId);
                                if (responseGameConnections) {
                                    responseGameConnections.forEach(function (connection) {
                                        if (connection.readyState === WebSocket.OPEN) {
                                            connection.send(JSON.stringify({
                                                type: "new_game_accepted",
                                                data: { newGameId: newGame_1.id, roomCode: newGame_1.roomCode },
                                            }));
                                        }
                                    });
                                }
                                return [3 /*break*/, 13];
                            case 12:
                                error_13 = _j.sent();
                                console.error("Error creating new game:", error_13);
                                ws.send(JSON.stringify({
                                    type: "error",
                                    data: { message: "Failed to create new game" },
                                }));
                                return [3 /*break*/, 13];
                            case 13: return [3 /*break*/, 15];
                            case 14:
                                responseGameConnections = gameRooms.get(responseGameId);
                                if (responseGameConnections) {
                                    responseGameConnections.forEach(function (connection) {
                                        if (connection !== ws && connection.readyState === WebSocket.OPEN) {
                                            connection.send(JSON.stringify({
                                                type: "new_game_rejected",
                                                data: { rejectingPlayerId: respondingPlayerId_1 },
                                            }));
                                        }
                                    });
                                }
                                _j.label = 15;
                            case 15: return [3 /*break*/, 16];
                            case 16: return [3 /*break*/, 18];
                            case 17:
                                error_14 = _j.sent();
                                console.error("WebSocket message error:", error_14);
                                ws.send(JSON.stringify({
                                    type: "error",
                                    data: { message: "Invalid message format" },
                                }));
                                return [3 /*break*/, 18];
                            case 18: return [2 /*return*/];
                        }
                    });
                }); });
                ws.on("close", function () {
                    // Remove connection from all game rooms
                    gameRooms.forEach(function (connections, gameId) {
                        connections.delete(ws);
                        if (connections.size === 0) {
                            gameRooms.delete(gameId);
                        }
                    });
                    // Remove from player connections
                    for (var _i = 0, _a = Array.from(playerConnections.entries()); _i < _a.length; _i++) {
                        var _b = _a[_i], playerId = _b[0], connection = _b[1];
                        if (connection === ws) {
                            playerConnections.delete(playerId);
                            break;
                        }
                    }
                });
            });
            return [2 /*return*/, httpServer];
        });
    });
}
