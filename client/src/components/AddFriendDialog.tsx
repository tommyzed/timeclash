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

interface AddFriendDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    opponentName: string;
}

export default function AddFriendDialog({
    isOpen,
    onClose,
    onConfirm,
    opponentName,
}: AddFriendDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Friend?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do you want to add <span className="font-bold">{opponentName}</span> as a friend?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
                        Yes! BFFs!
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
