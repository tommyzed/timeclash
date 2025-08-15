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
import { randomUUID, webcrypto } from "crypto";
import fs from "fs";
import path from "path";
var MemStorage = /** @class */ (function () {
    function MemStorage() {
        this.historicalEvents = new Map();
        this.games = new Map();
        this.gameMoves = new Map();
        this.players = new Map();
        // Initialize with curated historical events
        this.initializeHistoricalEvents();
    }
    MemStorage.prototype.initializeHistoricalEvents = function () {
        var _a;
        var _this = this;
        var eventsPath = path.join(__dirname, "events.json");
        var eventsData = fs.readFileSync(eventsPath, "utf-8");
        var events = JSON.parse(eventsData);
        // Shuffle the events array using crypto-secure randomization
        for (var i = events.length - 1; i > 0; i--) {
            var array = new Uint32Array(1);
            webcrypto.getRandomValues(array);
            var j = array[0] % (i + 1);
            _a = [events[j], events[i]], events[i] = _a[0], events[j] = _a[1];
        }
        events.forEach(function (event) {
            _this.historicalEvents.set(event.id, event);
        });
    };
    MemStorage.prototype.getHistoricalEvent = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.historicalEvents.get(id)];
            });
        });
    };
    MemStorage.prototype.getAllHistoricalEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.historicalEvents.values())];
            });
        });
    };
    MemStorage.prototype.getRandomHistoricalEvent = function (excludeIds) {
        return __awaiter(this, void 0, void 0, function () {
            var availableEvents, array, randomIndex;
            return __generator(this, function (_a) {
                availableEvents = Array.from(this.historicalEvents.values()).filter(function (event) { return !(excludeIds === null || excludeIds === void 0 ? void 0 : excludeIds.includes(event.id)); });
                if (availableEvents.length === 0)
                    return [2 /*return*/, undefined];
                array = new Uint32Array(1);
                webcrypto.getRandomValues(array);
                randomIndex = array[0] % availableEvents.length;
                return [2 /*return*/, availableEvents[randomIndex]];
            });
        });
    };
    MemStorage.prototype.getGame = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.games.get(id)];
            });
        });
    };
    MemStorage.prototype.createGame = function (roomCode) {
        return __awaiter(this, void 0, void 0, function () {
            var id, randomStartingEvent, attempt, startingEventId, game;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = randomUUID();
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempt < 5)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getRandomHistoricalEvent()];
                    case 2:
                        randomStartingEvent = _a.sent();
                        if (randomStartingEvent)
                            return [3 /*break*/, 4];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4:
                        startingEventId = (randomStartingEvent === null || randomStartingEvent === void 0 ? void 0 : randomStartingEvent.id) || "1";
                        game = {
                            id: id,
                            roomCode: roomCode || null,
                            player1Id: null,
                            player2Id: null,
                            currentTurn: null,
                            player1Score: 0,
                            player2Score: 0,
                            targetScore: 10,
                            currentEventId: null,
                            placedEventIds: [startingEventId], // Start with random historical event
                            attemptedEventIds: [startingEventId], // Track starting event as attempted
                            gameStatus: "waiting",
                            winnerPlayerId: null,
                            createdAt: new Date(),
                        };
                        this.games.set(id, game);
                        return [2 /*return*/, game];
                }
            });
        });
    };
    MemStorage.prototype.getGameByRoomCode = function (roomCode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.games.values()).find(function (game) { return game.roomCode === roomCode; })];
            });
        });
    };
    MemStorage.prototype.joinGame = function (gameId, playerId) {
        return __awaiter(this, void 0, void 0, function () {
            var game, updatedGame;
            return __generator(this, function (_a) {
                game = this.games.get(gameId);
                if (!game)
                    return [2 /*return*/, undefined];
                if (!game.player1Id) {
                    updatedGame = __assign(__assign({}, game), { player1Id: playerId, currentTurn: "player1" });
                }
                else if (!game.player2Id) {
                    updatedGame = __assign(__assign({}, game), { player2Id: playerId, gameStatus: "playing" });
                }
                else {
                    return [2 /*return*/, undefined]; // Game is full
                }
                this.games.set(gameId, updatedGame);
                return [2 /*return*/, updatedGame];
            });
        });
    };
    MemStorage.prototype.createPlayer = function (player) {
        return __awaiter(this, void 0, void 0, function () {
            var newPlayer;
            return __generator(this, function (_a) {
                newPlayer = {
                    id: randomUUID(),
                    nickname: player.nickname,
                    color: null,
                    createdAt: new Date(),
                };
                this.players.set(newPlayer.id, newPlayer);
                return [2 /*return*/, newPlayer];
            });
        });
    };
    MemStorage.prototype.getPlayer = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.players.get(id)];
            });
        });
    };
    MemStorage.prototype.updatePlayerColor = function (id, color) {
        return __awaiter(this, void 0, void 0, function () {
            var player, updatedPlayer;
            return __generator(this, function (_a) {
                player = this.players.get(id);
                if (!player)
                    return [2 /*return*/, undefined];
                updatedPlayer = __assign(__assign({}, player), { color: color });
                this.players.set(id, updatedPlayer);
                return [2 /*return*/, updatedPlayer];
            });
        });
    };
    MemStorage.prototype.updateGame = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var game, updatedGame;
            return __generator(this, function (_a) {
                game = this.games.get(id);
                if (!game)
                    return [2 /*return*/, undefined];
                updatedGame = __assign(__assign({}, game), updates);
                this.games.set(id, updatedGame);
                return [2 /*return*/, updatedGame];
            });
        });
    };
    MemStorage.prototype.getGameMoves = function (gameId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.gameMoves.values())
                        .filter(function (move) { return move.gameId === gameId; })
                        .sort(function (a, b) { return b.createdAt.getTime() - a.createdAt.getTime(); })];
            });
        });
    };
    MemStorage.prototype.createGameMove = function (moveData) {
        return __awaiter(this, void 0, void 0, function () {
            var id, move;
            return __generator(this, function (_a) {
                id = randomUUID();
                move = __assign(__assign({}, moveData), { id: id, createdAt: new Date() });
                this.gameMoves.set(id, move);
                return [2 /*return*/, move];
            });
        });
    };
    return MemStorage;
}());
export { MemStorage };
import { DrizzleStorage } from "./drizzle";
export function initStorage() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, DrizzleStorage.build()];
        });
    });
}
