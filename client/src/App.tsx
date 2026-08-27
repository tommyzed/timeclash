import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import Game from "@/pages/game";
import Lobby from "@/pages/lobby";
import NotFound from "@/pages/not-found";
import { AnimatePresence } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { queryClient } from "@/lib/queryClient";

import Dashboard from "@/pages/Dashboard";

import GameClaimer from "@/components/GameClaimer";
import DomainMigrationModal from "@/components/DomainMigrationModal";
import { UserProvider } from "@/context/UserContext";

export default function App() {
  const location = useLocation();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not defined");
  }

  return (
    <TooltipProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <DomainMigrationModal />
            <GameClaimer />
            <AnimatePresence mode="wait">
              <Switch location={location[0]} key={location[0]}>
                <Route path="/" component={Lobby} />
                <Route path="/lobby" component={Lobby} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/room/:roomCode" component={Lobby} />
                <Route path="/game" component={Game} />
                <Route path="/game/:gameId" component={Game} />
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </AnimatePresence>
          </UserProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
      <Toaster />
    </TooltipProvider>
  );
}
