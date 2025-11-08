import Avatar from "./Avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: string;
  online?: boolean;
  onBack?: () => void;
}

export default function ChatHeader({ name, avatar, status, online, onBack }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-testid="button-back"
          className="lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <Avatar name={name} src={avatar} size="md" online={online} />
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm truncate" data-testid="text-chat-name">
          {name}
        </h2>
        {status && (
          <p className="text-xs text-muted-foreground truncate" data-testid="text-chat-status">
            {status}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" data-testid="button-voice-call">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="button-video-call">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="button-more">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
