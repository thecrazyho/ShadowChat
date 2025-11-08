import { useState } from "react";
import ChatSidebar from "../ChatSidebar";

export default function ChatSidebarExample() {
  const [activeChat, setActiveChat] = useState("1");

  // TODO: remove mock functionality
  const mockChats = [
    {
      id: "1",
      name: "Alex Chen",
      lastMessage: "Hey, are you free tomorrow?",
      timestamp: "2m",
      unreadCount: 3,
      online: true,
    },
    {
      id: "2",
      name: "Sarah Miller",
      lastMessage: "Thanks for the help!",
      timestamp: "1h",
      online: true,
    },
    {
      id: "3",
      name: "Project Team",
      lastMessage: "Meeting at 3pm",
      timestamp: "3h",
      unreadCount: 12,
    },
    {
      id: "4",
      name: "Mike Johnson",
      lastMessage: "See you later!",
      timestamp: "1d",
      online: false,
    },
  ];

  return (
    <div className="h-screen w-80">
      <ChatSidebar
        currentUser={{ name: "John Doe", userId: "0001" }}
        chats={mockChats}
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        onNewChat={() => console.log("New chat clicked")}
        onCreateGroup={() => console.log("Create group clicked")}
      />
    </div>
  );
}
