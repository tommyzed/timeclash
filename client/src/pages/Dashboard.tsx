import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { useUserStats } from "@/hooks/useUserGames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X, Trophy, Gamepad2, History, RotateCcw, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ActiveGames from "@/components/ActiveGames";
import GameHistory from "@/components/GameHistory";
import FriendList from "@/components/FriendList";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import logoImage from "@assets/TimeClash.png";

import Auth from "@/components/Auth";

export default function Dashboard() {
    const { user, setUser, isLoading } = useUser();
    const [, setLocation] = useLocation();
    const { stats, loading: statsLoading } = useUserStats();
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");

    const handleStartEdit = () => {
        setEditName(user?.name || "");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditName("");
    };

    const handleSaveName = async () => {
        if (!editName.trim()) {
            toast({
                title: "Error",
                description: "Name cannot be empty",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await apiRequest("PATCH", "/api/users/me", { name: editName });
            const updatedUser = await response.json();
            // Update the local user context immediately
            setUser(updatedUser);

            toast({
                title: "Success",
                description: "Name updated successfully",
            });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update name",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        setLocation("/");
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 md:gap-6 flex-1 min-w-0">
                        {/* Navigation - Logo or Home Icon */}
                        <div
                            className={`shrink-0 cursor-pointer transition-opacity hover:opacity-80 ${isMobile ? "mt-1.5" : ""}`}
                            onClick={() => setLocation("/")}
                            title="Return to Game Lobby"
                        >
                            {isMobile ? (
                                <Home className="w-6 h-6 text-slate-700" />
                            ) : (
                                <img src={logoImage} alt="TimeClash Logo" className="h-16 w-auto" />
                            )}
                        </div>

                        {/* Welcome Text Section */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-9 text-lg font-bold w-full max-w-[200px] md:max-w-[300px]"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSaveName();
                                                if (e.key === "Escape") handleCancelEdit();
                                            }}
                                        />
                                        <Button size="icon" variant="ghost" onClick={handleSaveName} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0">
                                            <Check className="h-5 w-5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0">
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group min-w-0">
                                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">Hi, {user.name}</h1>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={handleStartEdit}
                                            className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-primary shrink-0"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm md:text-base text-muted-foreground mt-0.5 md:mt-1 truncate">
                                Manage your games and view your history
                            </p>
                        </div>
                    </div>

                    {/* Auth - stays on right */}
                    <div className="shrink-0 pt-0.5">
                        <Auth />
                    </div>
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
                                <p className="text-xs md:text-sm font-medium text-muted-foreground">Multiplayer Wins</p>
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
                                <p className="text-xs md:text-sm font-medium text-muted-foreground">Multiplayer Win Rate</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Main Content Areas */}
                    <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                        <Tabs defaultValue="active" className="space-y-4">
                            <TabsList className="bg-slate-200/60 p-1">
                                <TabsTrigger
                                    value="active"
                                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                                >
                                    Active Games
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                                >
                                    Game History
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="active" className="space-y-4">
                                <ActiveGames />
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                <GameHistory />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar - Friend List */}
                    <div className="space-y-6 order-1 lg:order-2">
                        <FriendList />
                    </div>
                </div>
            </div>
        </div>
    );
}
