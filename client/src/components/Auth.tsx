import { GoogleLogin } from "@react-oauth/google";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/UserContext";

export default function Auth() {
  const { user, setUser } = useUser();

  return (
    <div className="ml-4">
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
            <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                setUser(null);
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <GoogleLogin
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
