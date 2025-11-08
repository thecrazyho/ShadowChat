import { useState } from "react";
import ChatArea from "../ChatArea";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  status?: "sent" | "delivered" | "read";
}

export default function ChatAreaExample() {
  // TODO: remove mock functionality
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hey! How's the project going?",
      timestamp: "10:30 AM",
      senderId: "user2",
      senderName: "Alex Chen",
    },
    {
      id: "2",
      content: "Going great! Just finished the authentication flow.",
      timestamp: "10:32 AM",
      senderId: "user1",
      senderName: "Me",
      status: "read",
    },
    {
      id: "3",
      content: "That's awesome! Can you show me a demo?",
      timestamp: "10:33 AM",
      senderId: "user2",
      senderName: "Alex Chen",
    },
    {
      id: "4",
      content: "Sure, let me set up a meeting for this afternoon.",
      timestamp: "10:35 AM",
      senderId: "user1",
      senderName: "Me",
      status: "delivered",
    },
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderId: "user1",
      senderName: "Me",
      status: "sent",
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="h-screen">
      <ChatArea
        currentUserId="user1"
        chatName="Alex Chen"
        chatStatus="online"
        online={true}
        messages={messages}
        onSendMessage={handleSendMessage}
        onBack={() => console.log("Back clicked")}
      />
    </div>
  );
}
