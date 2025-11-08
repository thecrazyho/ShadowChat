import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Users, Settings } from "lucide-react";
import ChatListItem from "./ChatListItem";
import Avatar from "./Avatar";

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  online?: boolean;
}

interface ChatSidebarProps {
  currentUser: { name: string; userId: string; avatar?: string };
  chats: Chat[];
  activeChat?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onCreateGroup: () => void;
}

export default function ChatSidebar({
  currentUser,
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onCreateGroup,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser.name} src={currentUser.avatar} size="md" online={true} />
            <div>
              <p className="font-semibold text-sm" data-testid="text-current-user">
                {currentUser.name}
              </p>
              <p className="text-xs text-muted-foreground font-mono" data-testid="text-user-id">
                ID: {currentUser.userId}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" data-testid="button-settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-chats"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onNewChat}
            data-testid="button-new-chat"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onCreateGroup}
            data-testid="button-new-group"
          >
            <Users className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filteredChats.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No chats found</p>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                {...chat}
                isActive={chat.id === activeChat}
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
