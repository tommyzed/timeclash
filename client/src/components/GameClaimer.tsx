import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GameClaimer() {
    const { user } = useUser();
    const { toast } = useToast();
    const [location] = useLocation();

    useEffect(() => {
        const claimGame = async () => {
            // 1. Check if user is logged in
            if (!user) return;

            // 2. Only run on game pages (not lobby, dashboard, etc.)
            if (!location.startsWith("/game")) return;

            // 3. Check for gameId in localStorage
            const gameId = localStorage.getItem("gameId");
            const playerId = localStorage.getItem("playerId");

            // We need at least a gameId to claim anything.
            if (!gameId) return;

            // 4. Prevent repeated attempts (simple check)
            // We can use sessionStorage to mark that we've attempted for this session+game combo
            const claimKey = `claimed_game_${gameId}_${user.id}`;
            // If we've already claimed this specific game for this user, skip.
            if (sessionStorage.getItem(claimKey)) return;

            try {
                console.log(`Attempting to claim game ${gameId} for player ${playerId || "single-player"}...`);

                const response = await apiRequest("POST", `/api/games/${gameId}/claim`, {
                    playerId: playerId || undefined, // Send undefined if null, backend handles it
                });

                if (response.ok) {
                    const data = await response.json();
                    // Mark as processed so we don't try again
                    sessionStorage.setItem(claimKey, "true");

                    // Only show toast if a claim actually occurred (not already claimed by same user)
                    if (data.claimed) {
                        console.log("Game successfully claimed!");
                        toast({
                            title: "Game Synced!",
                            description: "Your current game has been saved to your account.",
                            variant: "success",
                            emoji: "🔗"
                        });
                        // Refresh game state and user games list
                        queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
                        queryClient.invalidateQueries({ queryKey: ["/api/users/me/games"] });
                    } else {
                        console.log("Game already claimed by this user, no toast needed.");
                    }
                } else if (response.status === 409) {
                    console.log("Game already claimed by another user.");
                    // Also mark as processed to avoid spam
                    sessionStorage.setItem(claimKey, "true");
                }
            } catch (error) {
                console.error("Failed to claim game:", error);
            }
        };

        claimGame();
    }, [user, toast, location]);

    return null; // This component renders nothing
}
