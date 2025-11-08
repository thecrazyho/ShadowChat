import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ChatSidebar from "@/components/ChatSidebar";
import ChatArea from "@/components/ChatArea";
import UserSearchModal from "@/components/UserSearchModal";
import CreateGroupModal from "@/components/CreateGroupModal";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

interface ChatProps {
  currentUser: any;
  onLogout: () => void;
}

export default function Chat({ currentUser }: ChatProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [chatMessages, setChatMessages] = useState<Record<string, any[]>>({});
  const { toast } = useToast();

  const { data: chats = [], refetch: refetchChats } = useQuery<any[]>({
    queryKey: ["/api/chats"],
  });

  const { mutate: createDirectChat } = useMutation({
    mutationFn: (userId: string) => api.createDirectChat(userId),
    onSuccess: (chat) => {
      refetchChats();
      setActiveChat(chat.id);
      setShowMobileSidebar(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create chat",
        variant: "destructive",
      });
    },
  });

  const { mutate: createGroup } = useMutation({
    mutationFn: (data: { name: string; inviteCode: string }) =>
      api.createChat({
        isGroup: true,
        name: data.name,
        inviteCode: data.inviteCode,
      }),
    onSuccess: (chat) => {
      refetchChats();
      setActiveChat(chat.id);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const socket = getSocket();

    socket.on("new_message", (message: any) => {
      setChatMessages((prev) => ({
        ...prev,
        [message.chatId]: [...(prev[message.chatId] || []), message],
      }));

      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    });

    socket.on("user_online", (userId: string) => {
      console.log("User online:", userId);
    });

    socket.on("user_offline", (userId: string) => {
      console.log("User offline:", userId);
    });

    return () => {
      socket.off("new_message");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      const socket = getSocket();
      socket.emit("join_chat", activeChat);

      api.getMessages(activeChat).then((messages) => {
        setChatMessages((prev) => ({
          ...prev,
          [activeChat]: messages,
        }));
      });

      return () => {
        socket.emit("leave_chat", activeChat);
      };
    }
  }, [activeChat]);

  const activeChatData = chats.find((chat: any) => chat.id === activeChat);
  const messages = chatMessages[activeChat || ""] || [];

  const handleSendMessage = (content: string, fileUrl?: string, fileType?: string) => {
    if (!activeChat) return;

    const socket = getSocket();
    socket.emit("send_message", {
      chatId: activeChat,
      content,
      fileUrl,
      fileType,
    });
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setShowMobileSidebar(false);
  };

  const handleSelectUser = (user: any) => {
    createDirectChat(user.id);
  };

  const handleCreateGroup = (data: { name: string; inviteCode: string }) => {
    createGroup(data);
  };

  const transformedChats = chats.map((chat: any) => ({
    id: chat.id,
    name: chat.name || chat.otherUser?.username || "Unknown",
    avatar: chat.otherUser?.avatar,
    lastMessage: chat.lastMessage?.content || "No messages yet",
    timestamp: chat.lastMessage
      ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    unreadCount: 0,
    online: false,
  }));

  const transformedMessages = messages.map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    senderId: msg.senderId,
    senderName: msg.sender?.username || "Unknown",
    status: "read" as const,
    fileUrl: msg.fileUrl,
    fileType: msg.fileType,
  }));

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`${
          showMobileSidebar ? "block" : "hidden"
        } lg:block w-full lg:w-80 h-full`}
      >
        <ChatSidebar
          currentUser={{
            name: currentUser.username,
            userId: String(currentUser.userId).padStart(4, "0"),
          }}
          chats={transformedChats}
          activeChat={activeChat || undefined}
          onSelectChat={handleSelectChat}
          onNewChat={() => setShowUserSearch(true)}
          onCreateGroup={() => setShowCreateGroup(true)}
        />
      </div>
      <div
        className={`${
          showMobileSidebar ? "hidden" : "block"
        } lg:block flex-1 h-full`}
      >
        {activeChatData ? (
          <ChatArea
            currentUserId={currentUser.id}
            chatName={activeChatData.name || activeChatData.otherUser?.username || "Unknown"}
            chatStatus="online"
            online={true}
            messages={transformedMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setShowMobileSidebar(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Lock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
      <UserSearchModal
        open={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleSelectUser}
      />
      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
