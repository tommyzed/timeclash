import { IStorage } from "../storage";

/**
 * Get game state with all related data
 */
export async function getGameState(storage: IStorage, gameId: string) {
    const game = await storage.getGame(gameId);
    if (!game) {
        return null;
    }

    const allMoves = await storage.getGameMoves(gameId);

    // Get placed events with player information
    const placedEvents = await getPlacedEvents(storage, game, allMoves);

    // Get current event
    const currentEvent = game.currentEventId
        ? (await storage.getHistoricalEvent(game.currentEventId)) ?? null
        : null;

    // Get recent moves
    const recentMoves = await getRecentMoves(storage, allMoves);

    // Calculate player stats
    const playerStats = calculatePlayerStats(game, allMoves);

    return {
        game,
        placedEvents,
        currentEvent,
        recentMoves,
        playerStats,
    };
}

/**
 * Get placed events with player names
 */
async function getPlacedEvents(storage: IStorage, game: any, allMoves: any[]) {
    const placedEvents = [];

    for (const eventId of game.placedEventIds) {
        const event = await storage.getHistoricalEvent(eventId);
        if (!event) continue;

        const placementMove = allMoves.find(
            (move) => move.eventId === eventId && move.isCorrect
        );

        let placedByPlayerName;
        if (placementMove && placementMove.playerId !== "single-player") {
            try {
                const player = await storage.getPlayer(placementMove.playerId);
                placedByPlayerName = player?.nickname;
            } catch (error) {
                console.error("Error fetching player for placed event:", error);
            }
        }

        placedEvents.push({
            event,
            position: game.placedEventIds.indexOf(eventId),
            placedByPlayerId: placementMove?.playerId,
            placedByPlayerName,
        });
    }

    placedEvents.sort((a, b) => a.event.year - b.event.year);
    return placedEvents;
}

/**
 * Get recent moves with event and player information
 */
async function getRecentMoves(storage: IStorage, allMoves: any[]) {
    const recentMoves = [];

    for (const move of allMoves.slice(0, 5)) {
        const event = await storage.getHistoricalEvent(move.eventId);
        if (event) {
            let playerName;
            if (move.playerId !== "single-player") {
                try {
                    const player = await storage.getPlayer(move.playerId);
                    playerName = player?.nickname;
                } catch (error) {
                    console.error("Error fetching player for recent move:", error);
                }
            }
            recentMoves.push({ ...move, event, playerName });
        }
    }

    return recentMoves;
}

/**
 * Calculate player statistics
 */
function calculatePlayerStats(game: any, allMoves: any[]) {
    if (game.roomCode) {
        const player1IncorrectCount = allMoves.filter(
            (move) => move.playerId === game.player1Id && !move.isCorrect
        ).length;
        const player2IncorrectCount = allMoves.filter(
            (move) => move.playerId === game.player2Id && !move.isCorrect
        ).length;
        return { player1IncorrectCount, player2IncorrectCount };
    } else {
        const player1IncorrectCount = allMoves.filter(
            (move) => !move.isCorrect
        ).length;
        return { player1IncorrectCount, player2IncorrectCount: 0 };
    }
}

/**
 * Get timeline events sorted by year
 */
export async function getTimelineEvents(storage: IStorage, placedEventIds: string[]) {
    const timelineEvents = [];

    for (const placedEventId of placedEventIds) {
        const placedEvent = await storage.getHistoricalEvent(placedEventId);
        if (placedEvent) {
            timelineEvents.push(placedEvent);
        }
    }

    timelineEvents.sort((a, b) => a.year - b.year);
    return timelineEvents;
}
