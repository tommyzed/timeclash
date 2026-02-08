import { GoogleLogin, googleLogout } from "@react-oauth/google";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { user, setUser } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return (
    <div className="ml-4" style={{ minWidth: user ? undefined : "240px", minHeight: "44px" }}>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={user.picture ?? undefined} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                googleLogout(); // Disable auto-select
                await fetch("/api/auth/logout", { method: "POST" });

                // Clear local storage on logout to prevent stale data
                localStorage.removeItem("playerId");
                localStorage.removeItem("nickname");
                localStorage.removeItem("gameId");

                setUser(null);
                setLocation("/");
                toast({
                  title: "Logged out",
                  description: "You are now logged out of your Time Clash account.",
                  variant: "warning",
                });
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <GoogleLogin
          size="large"
          text="signin_with"
          auto_select={false}
          onSuccess={async (credentialResponse) => {
            try {
              const response = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
              });
              if (response.ok) {
                const data = await response.json();
                setUser(data);
              }
            } catch (error) {
              console.error("Login failed:", error);
            }
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      )}
    </div>
  );
}
