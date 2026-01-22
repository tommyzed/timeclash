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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FriendRequestDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    onDeny: () => void;
    requesterName: string;
    requesterPicture?: string | null;
}

export default function FriendRequestDialog({
    isOpen,
    onClose,
    onAccept,
    onDeny,
    requesterName,
    requesterPicture,
}: FriendRequestDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        Friend Request!
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={requesterPicture || undefined} />
                                <AvatarFallback>{requesterName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <p className="text-center text-lg">
                                <span className="font-bold">{requesterName}</span> wants to be your friend!
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-between">
                    <AlertDialogCancel onClick={onDeny} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        Deny
                    </AlertDialogCancel>
                    <div className="flex gap-2">
                        <AlertDialogCancel onClick={onClose}>Decide Later</AlertDialogCancel>
                        <AlertDialogAction onClick={onAccept} className="bg-green-600 hover:bg-green-700">
                            Accept Friendship!
                        </AlertDialogAction>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
