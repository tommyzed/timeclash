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
        <div className="min-h-screen bg-slate-50 p-6">
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
                        Return to Game Lobby
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    <Card className="bg-white border-green-200 shadow-sm overflow-hidden">
                        <div className="p-3 md:p-4 flex items-center space-x-3 md:space-x-4">
                            <div className="p-2 md:p-3 bg-green-100 rounded-full">
                                <RotateCcw className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-medium text-muted-foreground">Active Games</p>
                                {statsLoading ? (
                                    <Skeleton className="h-6 w-10 md:h-7 md:w-12 mt-1" />
                                ) : (
                                    <h3 className="text-lg md:text-2xl font-bold text-green-900">{stats?.activeGames || 0}</h3>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border-blue-200 shadow-sm overflow-hidden">
                        <div className="p-3 md:p-4 flex items-center space-x-3 md:space-x-4">
                            <div className="p-2 md:p-3 bg-blue-100 rounded-full">
                                <Gamepad2 className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Games</p>
                                {statsLoading ? (
                                    <Skeleton className="h-6 w-10 md:h-7 md:w-12 mt-1" />
                                ) : (
                                    <h3 className="text-lg md:text-2xl font-bold text-blue-900">{stats?.totalGames || 0}</h3>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border-amber-200 shadow-sm overflow-hidden">
                        <div className="p-3 md:p-4 flex items-center space-x-3 md:space-x-4">
                            <div className="p-2 md:p-3 bg-amber-100 rounded-full">
                                <Trophy className="h-4 w-4 md:h-6 md:w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-medium text-muted-foreground">Wins</p>
                                {statsLoading ? (
                                    <Skeleton className="h-6 w-10 md:h-7 md:w-12 mt-1" />
                                ) : (
                                    <h3 className="text-lg md:text-2xl font-bold text-amber-900">{stats?.wins || 0}</h3>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border-purple-200 shadow-sm overflow-hidden">
                        <div className="p-3 md:p-4 flex items-center space-x-3 md:space-x-4">
                            <div className="p-2 md:p-3 bg-purple-100 rounded-full">
                                <History className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-medium text-muted-foreground">Win Rate</p>
                                {statsLoading ? (
                                    <Skeleton className="h-6 w-10 md:h-7 md:w-12 mt-1" />
                                ) : (
                                    <h3 className="text-lg md:text-2xl font-bold text-purple-900">
                                        {stats?.winRate ? `${Math.round(stats.winRate)}%` : "0%"}
                                    </h3>
                                )}
                            </div>
                        </div>
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
