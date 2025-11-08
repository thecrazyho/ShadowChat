import { useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  status?: "sent" | "delivered" | "read";
  fileUrl?: string;
  fileType?: string;
}

interface ChatAreaProps {
  currentUserId: string;
  chatName: string;
  chatAvatar?: string;
  chatStatus?: string;
  online?: boolean;
  messages: Message[];
  onSendMessage: (message: string, fileUrl?: string, fileType?: string) => void;
  onBack?: () => void;
}

export default function ChatArea({
  currentUserId,
  chatName,
  chatAvatar,
  chatStatus,
  online,
  messages,
  onSendMessage,
  onBack,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        name={chatName}
        avatar={chatAvatar}
        status={chatStatus}
        online={online}
        onBack={onBack}
      />
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((message, index) => {
            const isSender = message.senderId === currentUserId;
            const showAvatar = !isSender && (index === 0 || messages[index - 1].senderId !== message.senderId);
            
            return (
              <MessageBubble
                key={message.id}
                id={message.id}
                content={message.content}
                timestamp={message.timestamp}
                isSender={isSender}
                senderName={message.senderName}
                status={message.status}
                showAvatar={showAvatar}
                fileUrl={message.fileUrl}
                fileType={message.fileType}
              />
            );
          })}
        </div>
      </ScrollArea>
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}
