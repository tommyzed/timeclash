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
import { useUserGames, abandonGame, type EnrichedGame } from "@/hooks/useUserGames";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export default function ActiveGames() {
    const { user } = useUser();
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

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getOpponentName = (game: EnrichedGame): string | null => {
        if (!game.roomCode) return null; // Single player has no opponent

        const isPlayer1 = game.player1UserId === user?.id;
        if (isPlayer1) {
            return game.player2Name || null;
        } else {
            return game.player1Name || null;
        }
    };

    const isMyTurn = (game: EnrichedGame): boolean | null => {
        if (!game.roomCode || !game.currentTurn) return null; // Single player or no turn set

        const isPlayer1 = game.player1UserId === user?.id;
        const currentTurnIsPlayer1 = game.currentTurn === "player1";

        return isPlayer1 === currentTurnIsPlayer1;
    };

    const renderGameCard = (game: EnrichedGame, isWaiting: boolean) => {
        const isSinglePlayer = !game.roomCode;
        // If single player, show green "In Progress" even if technically "waiting" status in DB
        const showWaiting = isWaiting && !isSinglePlayer;

        const opponentName = getOpponentName(game);
        const myTurn = isMyTurn(game);

        const getCardStyle = () => {
            if (isSinglePlayer) return "bg-blue-50/70 border-blue-200 hover:bg-blue-50";
            if (showWaiting) return "bg-purple-50/70 border-purple-200 hover:bg-purple-50";
            if (myTurn) return "bg-green-50/70 border-green-200 hover:bg-green-50";
            return "bg-orange-50/70 border-orange-200 hover:bg-orange-50";
        };

        return (
            <Card
                key={game.id}
                className={`hover:shadow-lg transition-all cursor-pointer relative group ${getCardStyle()}`}
                onClick={() => handleResumeGame(game.id)}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent transition-colors z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        setGameToAbandon(game.id);
                    }}
                    title="Abandon Game"
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
                <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">
                                {isSinglePlayer
                                    ? "Single Player"
                                    : opponentName
                                        ? `vs ${opponentName}`
                                        : "Waiting for opponent..."
                                }
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {game.gameMode === "hard" ? "Hard Mode" : "Normal Mode"} • Target: {game.targetScore}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {showWaiting && (
                                <Badge className="bg-yellow-500">Waiting for opponent</Badge>
                            )}
                            {!isSinglePlayer && !showWaiting && myTurn !== null && (
                                <Badge className={myTurn ? "bg-green-500" : "bg-yellow-500"}>
                                    {myTurn ? "My Turn" : "Their Turn"}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            {game.roomCode && (
                                <span>Score: {game.player1Score} - {game.player2Score}</span>
                            )}
                            <span className={game.roomCode ? "" : "ml-auto"}>
                                Created: {formatDate(game.createdAt)}
                            </span>
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
                        <AlertDialogAction onClick={handleAbandonGame} disabled={abandoning} className="bg-destructive hover:bg-destructive/90">
                            {abandoning ? "Abandoning..." : "Abandon Game"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

