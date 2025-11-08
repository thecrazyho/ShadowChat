import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import { storage } from "./storage";
import { createSession, getSession, deleteSession } from "./auth";
import { insertUserSchema, loginSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

interface AuthRequest extends Request {
  userId?: string;
  sessionToken?: string;
}

const authenticateUser = async (req: AuthRequest, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const token = authHeader.substring(7);
  const session = getSession(token);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized - Invalid or expired session" });
  }

  req.userId = session.userId;
  req.sessionToken = token;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username);
      
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser(data);
      const sessionToken = createSession(user.id);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, sessionToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, inviteCode } = loginSchema.parse(req.body);
      const user = await storage.verifyUser(username, password, inviteCode);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials or invite code" });
      }

      const sessionToken = createSession(user.id);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, sessionToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", authenticateUser, async (req: AuthRequest, res) => {
    if (req.sessionToken) {
      deleteSession(req.sessionToken);
    }
    res.json({ success: true });
  });

  // User routes
  app.get("/api/users/search", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }

      const users = await storage.searchUsers(query);
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/me", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat routes
  app.get("/api/chats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const chats = await storage.getChatsByUserId(req.userId!);
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { isGroup, name, inviteCode } = req.body;
      
      const chat = await storage.createChat(
        { isGroup, name, inviteCode },
        req.userId!
      );
      
      res.json(chat);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chats/direct", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      const chat = await storage.getOrCreateDirectChat(req.userId!, userId);
      res.json(chat);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chats/:chatId/join", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { chatId } = req.params;
      const { inviteCode } = req.body;

      const chat = await storage.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (chat.isGroup && chat.inviteCode !== inviteCode) {
        return res.status(403).json({ error: "Invalid invite code" });
      }

      await storage.addChatMember(chatId, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/chats/:chatId/messages", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { chatId } = req.params;
      const messages = await storage.getMessagesByChatId(chatId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // File upload
  app.post("/api/upload", authenticateUser, upload.single("file"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const fileType = req.file.mimetype;

      res.json({ fileUrl, fileType, filename: req.file.originalname });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const userSockets = new Map<string, string>();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const session = getSession(token);
    if (!session) {
      return next(new Error("Invalid or expired session"));
    }

    socket.data.userId = session.userId;
    socket.data.sessionToken = token;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log("Client connected:", socket.id, "User:", userId);

    userSockets.set(userId, socket.id);
    io.emit("user_online", userId);

    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${userId} joined chat:`, chatId);
    });

    socket.on("leave_chat", (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on("send_message", async (data: any) => {
      try {
        const { chatId, content, fileUrl, fileType } = data;
        const senderId = socket.data.userId;

        const message = await storage.createMessage({
          chatId,
          senderId,
          content,
          fileUrl,
          fileType,
        });

        const sender = await storage.getUserById(senderId);
        const enrichedMessage = {
          ...message,
          sender,
        };

        io.to(chatId).emit("new_message", enrichedMessage);
      } catch (error: any) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("typing", (chatId: string) => {
      socket.to(chatId).emit("user_typing", {
        chatId,
        userId,
      });
    });

    socket.on("stop_typing", (chatId: string) => {
      socket.to(chatId).emit("user_stop_typing", {
        chatId,
        userId,
      });
    });

    socket.on("message_read", async (data: { messageId: string }) => {
      try {
        await storage.updateMessageStatus(data.messageId, userId, "read");
        
        io.emit("message_status_updated", {
          messageId: data.messageId,
          userId,
          status: "read",
        });
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    });

    socket.on("disconnect", () => {
      userSockets.delete(userId);
      io.emit("user_offline", userId);
      console.log("Client disconnected:", socket.id);
    });
  });

  return httpServer;
}
