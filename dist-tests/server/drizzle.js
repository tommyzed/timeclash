var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { eq, sql } from "drizzle-orm";
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}
var Pool = pg.Pool;
export var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
var db = drizzle(pool, { schema: schema });
var DrizzleStorage = /** @class */ (function () {
    function DrizzleStorage() {
    }
    DrizzleStorage.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storage = new DrizzleStorage();
                        return [4 /*yield*/, storage.seed()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, storage];
                }
            });
        });
    };
    DrizzleStorage.prototype.seed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var countResult, count, __dirname, eventsPath, eventsData, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select({ count: sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) }).from(schema.historicalEvents)];
                    case 1:
                        countResult = _a.sent();
                        count = countResult[0].count;
                        if (count > 0) {
                            return [2 /*return*/];
                        }
                        __dirname = path.dirname(fileURLToPath(import.meta.url));
                        eventsPath = path.join(__dirname, "events.json");
                        eventsData = fs.readFileSync(eventsPath, "utf-8");
                        events = JSON.parse(eventsData);
                        return [4 /*yield*/, db.insert(schema.historicalEvents).values(events)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DrizzleStorage.prototype.getHistoricalEvent = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(schema.historicalEvents).where(eq(schema.historicalEvents.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getAllHistoricalEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db.select().from(schema.historicalEvents)];
            });
        });
    };
    DrizzleStorage.prototype.getRandomHistoricalEvent = function (excludeIds) {
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = excludeIds
                            ? db.select().from(schema.historicalEvents).where(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " not in ", ""], ["", " not in ", ""])), schema.historicalEvents.id, excludeIds)).orderBy(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["random()"], ["random()"])))).limit(1)
                            : db.select().from(schema.historicalEvents).orderBy(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["random()"], ["random()"])))).limit(1);
                        return [4 /*yield*/, query];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getGame = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(schema.games).where(eq(schema.games.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getGameByRoomCode = function (roomCode) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(schema.games).where(eq(schema.games.roomCode, roomCode))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.createGame = function (roomCode) {
        return __awaiter(this, void 0, void 0, function () {
            var randomStartingEvent, startingEventId, newGame, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRandomHistoricalEvent()];
                    case 1:
                        randomStartingEvent = _a.sent();
                        startingEventId = (randomStartingEvent === null || randomStartingEvent === void 0 ? void 0 : randomStartingEvent.id) || "1";
                        newGame = {
                            roomCode: roomCode,
                            placedEventIds: [startingEventId],
                            attemptedEventIds: [startingEventId],
                        };
                        return [4 /*yield*/, db.insert(schema.games).values(newGame).returning()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateGame = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(schema.games).set(updates).where(eq(schema.games.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.joinGame = function (gameId, playerId) {
        return __awaiter(this, void 0, void 0, function () {
            var game, updatedGame, firstTurn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getGame(gameId)];
                    case 1:
                        game = _a.sent();
                        if (!game)
                            return [2 /*return*/, undefined];
                        if (!!game.player1Id) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updateGame(gameId, { player1Id: playerId })];
                    case 2:
                        updatedGame = _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        if (!!game.player2Id) return [3 /*break*/, 5];
                        firstTurn = Math.random() < 0.5 ? "player1" : "player2";
                        return [4 /*yield*/, this.updateGame(gameId, {
                                player2Id: playerId,
                                gameStatus: "playing",
                                currentTurn: firstTurn,
                            })];
                    case 4:
                        updatedGame = _a.sent();
                        return [3 /*break*/, 6];
                    case 5: return [2 /*return*/, undefined]; // Game is full
                    case 6: return [2 /*return*/, updatedGame];
                }
            });
        });
    };
    DrizzleStorage.prototype.createPlayer = function (player) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(schema.players).values(player).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getPlayer = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(schema.players).where(eq(schema.players.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updatePlayerColor = function (id, color) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(schema.players).set({ color: color }).where(eq(schema.players.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getGameMoves = function (gameId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db.select().from(schema.gameMoves).where(eq(schema.gameMoves.gameId, gameId)).orderBy(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["", " desc"], ["", " desc"])), schema.gameMoves.createdAt))];
            });
        });
    };
    DrizzleStorage.prototype.createGameMove = function (move) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(schema.gameMoves).values(move).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    return DrizzleStorage;
}());
export { DrizzleStorage };
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
