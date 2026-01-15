import { type Game } from "@shared/schema";

/**
 * Validate multiplayer turn
 */
export function validateMultiplayerTurn(
    game: Game,
    playerId: string | undefined
): { valid: boolean; error?: string } {
    if (!playerId) {
        return {
            valid: false,
            error: "Player ID required for multiplayer",
        };
    }

    const isPlayer1 = playerId === game.player1Id;
    const isPlayer2 = playerId === game.player2Id;

    if (!isPlayer1 && !isPlayer2) {
        return {
            valid: false,
            error: "You are not a player in this game",
        };
    }

    const expectedTurn = isPlayer1 ? "player1" : "player2";
    if (game.currentTurn !== expectedTurn) {
        return {
            valid: false,
            error: "It's not your turn",
        };
    }

    return { valid: true };
}

/**
 * Validate settings update
 */
export function validateSettingsUpdate(settings: {
    targetScore?: number;
    categories?: string[];
    eras?: string[];
}): { valid: boolean; error?: string } {
    if (settings.targetScore !== undefined) {
        if (settings.targetScore < 5 || settings.targetScore > 15) {
            return {
                valid: false,
                error: "Target score must be between 5 and 15",
            };
        }
    }

    if (settings.categories !== undefined) {
        if (
            !Array.isArray(settings.categories) ||
            settings.categories.length === 0 ||
            !settings.categories.every((c) =>
                ["Politics", "Science", "History", "Culture"].includes(c)
            )
        ) {
            return {
                valid: false,
                error: "Invalid categories",
            };
        }
    }

    if (settings.eras !== undefined) {
        if (
            !Array.isArray(settings.eras) ||
            settings.eras.length === 0 ||
            !settings.eras.every((c) =>
                ["Ancient", "Classical", "Modern"].includes(c)
            )
        ) {
            return {
                valid: false,
                error: "Invalid eras",
            };
        }
    }

    return { valid: true };
}

/**
 * Format year for display
 */
export function formatYear(year: number): string {
    return year < 0 ? `${Math.abs(year)} B.C.` : String(year);
}
