import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserGames, abandonGame } from "@/hooks/useUserGames";
import { useToast } from "@/hooks/use-toast";
import type { Game } from "@shared/schema";

export default function ActiveGames() {
    const { activeGames, loading, error, refetch } = useUserGames();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [gameToAbandon, setGameToAbandon] = useState<string | null>(null);
    const [abandoning, setAbandoning] = useState(false);

    const handleResumeGame = (gameId: string) => {
        setLocation(`/game/${gameId}`);
    };

    const handleAbandonGame = async () => {
        if (!gameToAbandon) return;

        setAbandoning(true);
        try {
            await abandonGame(gameToAbandon);
            toast({
                title: "Game Abandoned",
                description: "The game has been marked as abandoned.",
            });
            refetch();
        } catch (err) {
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to abandon game",
                variant: "destructive",
            });
        } finally {
            setAbandoning(false);
            setGameToAbandon(null);
        }
    };

    const renderGameCard = (game: Game, isWaiting: boolean) => {
        const statusColor = isWaiting ? "bg-yellow-500" : "bg-green-500";
        const statusText = isWaiting ? "Waiting for opponent" : "In Progress";

        return (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-lg">
                                {game.roomCode ? `Room: ${game.roomCode}` : "Single Player"}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {game.gameMode === "hard" ? "Hard Mode" : "Normal Mode"} • Target: {game.targetScore}
                            </CardDescription>
                        </div>
                        <Badge className={statusColor}>{statusText}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {game.roomCode && (
                            <div className="text-sm text-muted-foreground">
                                Score: {game.player1Score} - {game.player2Score}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button onClick={() => handleResumeGame(game.id)} className="flex-1">
                                Resume Game
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setGameToAbandon(game.id)}
                                className="flex-1"
                            >
                                Abandon
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading your games...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-destructive">Error: {error}</div>
            </div>
        );
    }

    const allGames = [
        ...(activeGames?.activeGames || []),
        ...(activeGames?.waitingGames || []),
    ];

    if (allGames.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">You don't have any active games</p>
                    <Button onClick={() => setLocation("/")}>Start a New Game</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeGames?.waitingGames.map((game) => renderGameCard(game, true))}
                {activeGames?.activeGames.map((game) => renderGameCard(game, false))}
            </div>

            <AlertDialog open={!!gameToAbandon} onOpenChange={() => setGameToAbandon(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Abandon Game?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to abandon this game? This action cannot be undone.
                            The game will be marked as abandoned in your history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={abandoning}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAbandonGame} disabled={abandoning}>
                            {abandoning ? "Abandoning..." : "Abandon Game"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
