import { useState } from "react";
import ChatListItem from "../ChatListItem";

export default function ChatListItemExample() {
  const [activeId, setActiveId] = useState("1");

  return (
    <div className="w-80 space-y-2 p-4">
      <ChatListItem
        id="1"
        name="Alex Chen"
        lastMessage="Hey, are you free tomorrow?"
        timestamp="2m"
        unreadCount={3}
        online={true}
        isActive={activeId === "1"}
        onClick={() => setActiveId("1")}
      />
      <ChatListItem
        id="2"
        name="Sarah Miller"
        lastMessage="Thanks for the help!"
        timestamp="1h"
        online={true}
        isActive={activeId === "2"}
        onClick={() => setActiveId("2")}
      />
      <ChatListItem
        id="3"
        name="Project Team"
        lastMessage="Meeting at 3pm"
        timestamp="3h"
        unreadCount={12}
        isActive={activeId === "3"}
        onClick={() => setActiveId("3")}
      />
    </div>
  );
}
