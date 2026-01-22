import { useQuery, useMutation } from "@tanstack/react-query";
import { type Friendship } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, UserX, UserPlus, Clock, ArrowRightLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type FriendRequest = Friendship & {
    otherUser: {
        id: string;
        name: string;
        picture: string | null;
        email: string;
    }
};

export default function FriendList() {
    const { user } = useUser();
    const { toast } = useToast();

    const { data: friends = [], isLoading } = useQuery<FriendRequest[]>({
        queryKey: ["/api/friends"],
    });

    const acceptMutation = useMutation({
        mutationFn: async (friendshipId: string) => {
            await apiRequest("POST", `/api/friends/${friendshipId}/accept`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
            toast({
                title: "Accepted",
                description: "Friend request accepted.",
                variant: "success",
            });
        },
        onError: () => toast({ title: "Error", description: "Failed to accept.", variant: "destructive" })
    });

    const deleteMutation = useMutation({
        mutationFn: async (friendshipId: string) => {
            await apiRequest("DELETE", `/api/friends/${friendshipId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
            toast({ title: "Removed", description: "Friend removed." });
        },
        onError: () => toast({ title: "Error", description: "Failed to remove.", variant: "destructive" })
    });

    if (isLoading) return <div className="h-16 bg-gray-50 rounded-lg animate-pulse" />;

    // Sort: Incoming Pending -> Outgoing Pending -> Accepted
    const sortedFriends = [...friends].sort((a, b) => {
        const getPriority = (f: FriendRequest) => {
            if (f.status === "pending" && f.userId1 === user?.id) return 1; // Outgoing
            if (f.status === "pending") return 0; // Incoming (default if not outgoing)
            return 2; // Accepted
        };
        return getPriority(a) - getPriority(b);
    });

    if (sortedFriends.length === 0) {
        return (
            <Card className="bg-white/50 border-dashed">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <UserPlus className="w-8 h-8 text-gray-300" />
                        <p>No currently active friends</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm bg-white/80">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Friends
                    <Badge variant="secondary" className="ml-1 text-xs">{friends.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="max-h-[300px]">
                    <div className="divide-y divide-gray-100">
                        {sortedFriends.map((f) => {
                            const isOutgoing = f.status === "pending" && f.userId1 === user?.id;
                            const isIncoming = f.status === "pending" && !isOutgoing;
                            const isAccepted = f.status === "accepted";

                            let bgClass = "hover:bg-gray-50";
                            if (isAccepted) bgClass = "bg-green-50/50 hover:bg-green-100/50";
                            if (isIncoming || isOutgoing) bgClass = "bg-yellow-50/50 hover:bg-yellow-100/50";

                            return (
                                <div key={f.id} className={`flex items-center justify-between p-3 transition-colors ${bgClass}`}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative">
                                            <Avatar className="h-8 w-8 border border-gray-100">
                                                <AvatarImage src={f.otherUser.picture || undefined} />
                                                <AvatarFallback className="text-xs bg-gray-100 text-gray-500">
                                                    {f.otherUser.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isIncoming && <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full ring-2 ring-white" title="Incoming Request"><ArrowRightLeft className="w-2.5 h-2.5" /></div>}
                                            {isOutgoing && <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white p-0.5 rounded-full ring-2 ring-white" title="Sent Request"><Clock className="w-2.5 h-2.5" /></div>}
                                        </div>

                                        <div className="flex flex-col truncate">
                                            <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-[200px]">
                                                {f.otherUser.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                {isIncoming && <span className="text-blue-600 font-medium">Request Received</span>}
                                                {isOutgoing && <span className="text-yellow-600">Request Sent</span>}
                                                {isAccepted && <span>Friend</span>}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {isIncoming && (
                                            <Button size="icon" className="h-7 w-7 bg-green-100 hover:bg-green-200 text-green-700 shadow-none border border-green-200" onClick={() => acceptMutation.mutate(f.id)} title="Accept">
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        )}

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`h-7 w-7 ${isIncoming ? 'text-red-400 hover:text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                                            onClick={() => deleteMutation.mutate(f.id)}
                                            title={isIncoming ? "Deny" : isOutgoing ? "Cancel" : "Remove"}
                                        >
                                            {isIncoming ? <X className="w-4 h-4" /> : isOutgoing ? <X className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
