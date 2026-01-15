import { IStorage } from "../storage";
import { type Game } from "@shared/schema";

/**
 * Check if an event placement is correct in the timeline
 */
export function isPlacementCorrect(
    eventYear: number,
    position: number,
    timelineEvents: Array<{ year: number }>
): boolean {
    if (position === 0) {
        // Placing at the beginning
        return eventYear <= timelineEvents[0].year;
    } else if (position >= timelineEvents.length) {
        // Placing at the end
        return eventYear >= timelineEvents[timelineEvents.length - 1].year;
    } else {
        // Placing in the middle
        const prevEvent = timelineEvents[position - 1];
        const nextEvent = timelineEvents[position];
        return eventYear >= prevEvent.year && eventYear <= nextEvent.year;
    }
}

/**
 * Handle successful steal attempt in multiplayer
 */
export function handleSuccessfulSteal(
    game: Game,
    playerId: string,
    newPlacedEventIds: string[]
): Partial<Game> {
    const updateData: Partial<Game> = {
        placedEventIds: newPlacedEventIds,
        stealingPlayerId: null,
    };

    // Award point to the stealer
    let newScore = 0;
    if (playerId === game.player1Id) {
        newScore = game.player1Score + 1;
        updateData.player1Score = newScore;
    } else if (playerId === game.player2Id) {
        newScore = game.player2Score + 1;
        updateData.player2Score = newScore;
    }

    // Check for winner
    if (newScore >= game.targetScore) {
        updateData.gameStatus = "completed";
        updateData.winnerPlayerId = playerId;
    }

    // Turn goes back to the other player
    updateData.currentTurn =
        game.currentTurn === "player1" ? "player2" : "player1";

    return updateData;
}

/**
 * Handle correct move in multiplayer game
 */
export function handleMultiplayerCorrectMove(
    game: Game,
    playerId: string,
    newPlacedEventIds: string[]
): Partial<Game> {
    const updateData: Partial<Game> = {
        placedEventIds: newPlacedEventIds,
    };

    // Update player score
    if (playerId === game.player1Id) {
        updateData.player1Score = game.player1Score + 1;
    } else if (playerId === game.player2Id) {
        updateData.player2Score = game.player2Score + 1;
    }

    // Switch turns after correct move
    updateData.currentTurn =
        game.currentTurn === "player1" ? "player2" : "player1";

    // Check for winner
    const newScore =
        playerId === game.player1Id
            ? game.player1Score + 1
            : game.player2Score + 1;

    if (newScore >= game.targetScore) {
        updateData.gameStatus = "completed";
        updateData.winnerPlayerId = playerId;
    }

    return updateData;
}

/**
 * Handle correct move in single player game
 */
export function handleSinglePlayerCorrectMove(
    game: Game,
    playerId: string | undefined,
    newPlacedEventIds: string[]
): Partial<Game> {
    const updateData: Partial<Game> = {
        placedEventIds: newPlacedEventIds,
    };

    const newScore = game.player1Score + 1;
    updateData.player1Score = newScore;

    if (game.gameMode === "hard") {
        updateData.attempts = (game.attempts || 0) + 1;
    }

    if (newScore >= game.targetScore) {
        updateData.gameStatus = "completed";
        updateData.winnerPlayerId = playerId || "single-player";
    } else if (
        game.gameMode === "hard" &&
        (updateData.attempts || game.attempts) >= (game.maxAttempts || 0)
    ) {
        updateData.gameStatus = "completed";
        updateData.winnerPlayerId = "computer";
    }

    return updateData;
}

/**
 * Handle failed steal attempt in multiplayer
 */
export function handleFailedSteal(game: Game): Partial<Game> {
    return {
        stealingPlayerId: null,
        currentTurn: game.currentTurn === "player1" ? "player2" : "player1",
    };
}

/**
 * Handle incorrect move with stealing enabled
 */
export function handleStealingMode(game: Game): Partial<Game> {
    const opponentPlayer =
        game.currentTurn === "player1" ? game.player2Id : game.player1Id;

    return {
        stealingPlayerId: opponentPlayer,
        currentTurn: game.currentTurn === "player1" ? "player2" : "player1",
    };
}

/**
 * Handle incorrect move without stealing
 */
export function handleIncorrectMove(game: Game): Partial<Game> {
    return {
        currentTurn: game.currentTurn === "player1" ? "player2" : "player1",
    };
}

/**
 * Handle incorrect move in hard mode single player
 */
export function handleSinglePlayerIncorrectMove(game: Game): Partial<Game> {
    const updateData: Partial<Game> = {
        attempts: (game.attempts || 0) + 1,
    };

    if (updateData.attempts! >= (game.maxAttempts || 0)) {
        updateData.gameStatus = "completed";
        updateData.winnerPlayerId = "computer";
    }

    return updateData;
}

/**
 * Get the next event for the game
 */
export async function getNextEvent(
    storage: IStorage,
    game: Game,
    placedEventIds: string[],
    attemptedEventIds: string[],
    inStealingMode: boolean
): Promise<string | null> {
    if (inStealingMode) {
        // In stealing mode, keep the current event
        return game.currentEventId;
    }

    const nextEvent = await storage.getRandomHistoricalEvent(
        [...placedEventIds, ...attemptedEventIds],
        game.categories,
        game.eras
    );

    return nextEvent?.id || null;
}
