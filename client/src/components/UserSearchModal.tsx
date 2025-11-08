import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Avatar from "./Avatar";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  userId: number;
}

interface UserSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export default function UserSearchModal({ open, onClose, onSelectUser }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: () => (searchQuery ? api.searchUsers(searchQuery) : Promise.resolve([])),
    enabled: searchQuery.length > 0,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
          <DialogDescription>Search for a user by name or ID</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-user-search"
            />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {searchQuery ? "No users found" : "Start typing to search"}
              </p>
            ) : (
              users.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                    setSearchQuery("");
                  }}
                  data-testid={`user-result-${String(user.userId).padStart(4, "0")}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover-elevate text-left"
                >
                  <Avatar name={user.username} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.username}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      ID: {String(user.userId).padStart(4, "0")}
                    </p>
                  </div>
                  <Button size="sm" data-testid={`button-start-chat-${String(user.userId).padStart(4, "0")}`}>
                    Chat
                  </Button>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
