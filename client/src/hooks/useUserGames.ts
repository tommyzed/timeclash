import { useState, useEffect, useCallback } from "react";
import type { Game } from "@shared/schema";

export type EnrichedGame = Game & {
    player1Name?: string;
    player2Name?: string;
};

export type UserGamesData = {
    activeGames: EnrichedGame[];
    waitingGames: EnrichedGame[];
    total: number;
};

export type UserHistoryData = {
    games: EnrichedGame[];
    limit: number;
    offset: number;
};

export type UserStatsData = {
    totalGames: number;
    completedGames: number;
    activeGames: number;
    wins: number;
    losses: number;
    winRate: number;
};

export function useUserGames() {
    const [activeGames, setActiveGames] = useState<UserGamesData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActiveGames = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/users/me/games");
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Not authenticated");
                }
                throw new Error("Failed to fetch active games");
            }
            const data = await response.json();
            setActiveGames(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActiveGames();
    }, [fetchActiveGames]);

    return { activeGames, loading, error, refetch: fetchActiveGames };
}

export function useUserHistory(limit = 20, offset = 0) {
    const [history, setHistory] = useState<UserHistoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/users/me/history?limit=${limit}&offset=${offset}`
            );
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Not authenticated");
                }
                throw new Error("Failed to fetch game history");
            }
            const data = await response.json();
            setHistory(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, error, refetch: fetchHistory };
}

export function useUserStats() {
    const [stats, setStats] = useState<UserStatsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/users/me/stats");
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Not authenticated");
                }
                throw new Error("Failed to fetch stats");
            }
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}

export async function abandonGame(gameId: string): Promise<void> {
    const response = await fetch(`/api/games/${gameId}/abandon`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to abandon game");
    }
}
