import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
    const { data: activeGames, isLoading: loading, error, refetch } = useQuery<UserGamesData>({
        queryKey: ["/api/users/me/games"],
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchInterval: 5000,
    });

    return {
        activeGames: activeGames || null,
        loading,
        error: error ? (error as Error).message : null,
        refetch
    };
}

export function useUserHistory(limit = 20, offset = 0, excludeAbandoned = false) {
    const [history, setHistory] = useState<UserHistoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/users/me/history?limit=${limit}&offset=${offset}&excludeAbandoned=${excludeAbandoned}`
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
    }, [limit, offset, excludeAbandoned]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, error, refetch: fetchHistory };
}

export function useUserStats() {
    const { data: stats, isLoading: loading, error, refetch } = useQuery<UserStatsData>({
        queryKey: ["/api/users/me/stats"],
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchInterval: 10000, // Poll stats slightly less frequently
    });

    return {
        stats: stats || null,
        loading,
        error: error ? (error as Error).message : null,
        refetch
    };
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
