import Avatar from "./Avatar";
import { Badge } from "@/components/ui/badge";

interface ChatListItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  online?: boolean;
  isActive?: boolean;
  onClick: () => void;
}

export default function ChatListItem({
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount,
  online,
  isActive,
  onClick,
}: ChatListItemProps) {
  return (
    <button
      onClick={onClick}
      data-testid={`chat-item-${name}`}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover-elevate ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <Avatar name={name} src={avatar} size="md" online={online} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-medium text-sm truncate">{name}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timestamp}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
      </div>
      {unreadCount && unreadCount > 0 ? (
        <Badge className="ml-auto shrink-0">{unreadCount}</Badge>
      ) : null}
    </button>
  );
}
