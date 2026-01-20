import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserHistory, type EnrichedGame } from "@/hooks/useUserGames";
import { ChevronLeft, ChevronRight, Trophy, XCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function GameHistory() {
    const [page, setPage] = useState(0);
    const [hideAbandoned, setHideAbandoned] = useState(true);
    const pageSize = 10;
    const { history, loading, error } = useUserHistory(pageSize, page * pageSize);
    const { user } = useUser();

    // Filter out abandoned games if hideAbandoned is enabled
    const filteredGames = history?.games.filter(
        (game) => !hideAbandoned || game.gameStatus !== "abandoned"
    ) || [];

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getGameResult = (game: EnrichedGame) => {
        if (game.gameStatus === "abandoned") {
            return {
                text: "Abandoned",
                color: "bg-red-500",
                icon: XCircle,
                cardStyle: "bg-red-100 border-red-300 hover:bg-red-200"
            };
        }

        // Single player - completed successfully
        if (!game.roomCode && game.gameStatus === "completed") {
            return {
                text: "Completed",
                color: "bg-blue-500",
                icon: Trophy,
                cardStyle: "bg-blue-100 border-blue-300 hover:bg-blue-200"
            };
        }

        // Multiplayer - check winner
        if (game.winnerPlayerId && user) {
            // Determine which player ID belongs to the current user
            const myPlayerId = game.player1UserId === user.id ? game.player1Id : game.player2Id;
            const isWinner = myPlayerId === game.winnerPlayerId;

            return {
                text: isWinner ? "Won" : "Lost",
                color: isWinner ? "bg-green-500" : "bg-yellow-500",
                icon: isWinner ? Trophy : XCircle,
                cardStyle: isWinner
                    ? "bg-green-100 border-green-300 hover:bg-green-200"
                    : "bg-yellow-100 border-yellow-300 hover:bg-yellow-200"
            };
        }

        return {
            text: "Completed",
            color: "bg-gray-500",
            icon: Trophy,
            cardStyle: "bg-gray-100 border-gray-300 hover:bg-gray-200"
        };
    };

    const renderGameCard = (game: EnrichedGame) => {
        const result = getGameResult(game);
        const Icon = result.icon;

        const isSinglePlayer = !game.roomCode;
        let opponentName = "";

        if (user && !isSinglePlayer) {
            if (game.player1UserId === user.id) {
                opponentName = game.player2Name || "Player 2";
            } else {
                opponentName = game.player1Name || "Player 1";
            }
        }

        return (
            <Card key={game.id} className={`hover:shadow-md transition-shadow ${result.cardStyle}`}>
                <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">
                                {isSinglePlayer ? "Single Player" : `vs ${opponentName}`}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {game.gameMode === "hard" ? "Hard Mode" : "Normal Mode"} • Target: {game.targetScore}
                            </CardDescription>
                        </div>
                        <Badge className={result.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {result.text}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        {game.roomCode && (
                            <span>Score: {game.player1Score} - {game.player2Score}</span>
                        )}
                        <span className={game.roomCode ? "" : "ml-auto"}>
                            Created: {formatDate(game.createdAt)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading game history...</div>
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

    if (!history || history.games.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No game history yet</p>
                    <p className="text-sm text-muted-foreground">
                        Complete some games to see them appear here!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Hide Abandoned Checkbox */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="hide-abandoned"
                    checked={hideAbandoned}
                    onCheckedChange={(checked) => setHideAbandoned(checked === true)}
                />
                <label
                    htmlFor="hide-abandoned"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                    Hide Abandoned Games
                </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGames.map(renderGameCard)}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {page + 1}
                </span>
                <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={history.games.length < pageSize}
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
