import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { useUserStats } from "@/hooks/useUserGames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Gamepad2, History, RotateCcw } from "lucide-react";
import ActiveGames from "@/components/ActiveGames";
import GameHistory from "@/components/GameHistory";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
    const { user } = useUser();
    const [, setLocation] = useLocation();
    const { stats, loading: statsLoading } = useUserStats();

    if (!user) {
        setLocation("/");
        return null;
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your games and view your history
                        </p>
                    </div>
                    <Button onClick={() => setLocation("/")} size="lg" className="w-full md:w-auto">
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Start New Game
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{stats?.totalGames || 0}</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Wins</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{stats?.wins || 0}</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">
                                    {stats?.winRate ? `${Math.round(stats.winRate)}%` : "0%"}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
                            <RotateCcw className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{stats?.activeGames || 0}</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Areas */}
                <Tabs defaultValue="active" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="active">Active Games</TabsTrigger>
                        <TabsTrigger value="history">Game History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        <ActiveGames />
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <GameHistory />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
