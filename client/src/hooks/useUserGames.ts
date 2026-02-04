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
        staleTime: 0, // Ensure data is considered stale immediately for refetching
    });

    return {
        activeGames: activeGames || null,
        loading,
        error: error ? (error as Error).message : null,
        refetch
    };
}

export function useUserHistory(limit = 20, offset = 0, excludeAbandoned = false) {
    // Unique query key including pagination params to ensure caching separates pages
    const { data: history, isLoading: loading, error, refetch } = useQuery<UserHistoryData>({
        queryKey: ["/api/users/me/history", limit, offset, excludeAbandoned],
        queryFn: async () => {
            const response = await fetch(
                `/api/users/me/history?limit=${limit}&offset=${offset}&excludeAbandoned=${excludeAbandoned}`
            );
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Not authenticated");
                }
                throw new Error("Failed to fetch game history");
            }
            return response.json();
        },
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    return {
        history: history || null,
        loading,
        error: error ? (error as Error).message : null,
        refetch
    };
}

export function useUserStats() {
    const { data: stats, isLoading: loading, error, refetch } = useQuery<UserStatsData>({
        queryKey: ["/api/users/me/stats"],
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchInterval: 10000,
        staleTime: 0,
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
