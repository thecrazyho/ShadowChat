import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthForm from "@/components/AuthForm";
import Chat from "@/pages/Chat";
import { api, setSessionToken, clearSession } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedToken = localStorage.getItem("sessionToken");
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setSessionToken(storedToken);
        setIsAuthenticated(true);
        connectSocket();
      } catch (error) {
        clearSession();
      }
    }
    
    setIsLoading(false);

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleAuth = async (data: { username: string; password: string; inviteCode: string }) => {
    const isLogin = localStorage.getItem("authMode") === "login";
    const response = isLogin ? await api.login(data) : await api.register(data);
    
    setCurrentUser(response.user);
    setSessionToken(response.sessionToken);
    setIsAuthenticated(true);
    localStorage.setItem("currentUser", JSON.stringify(response.user));
    connectSocket();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    clearSession();
    disconnectSocket();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onSubmit={handleAuth} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Chat currentUser={currentUser} onLogout={handleLogout} />} />
      <Route path="/chat" component={() => <Chat currentUser={currentUser} onLogout={handleLogout} />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
