import { db } from "./db";
import { 
  users, chats, chatMembers, messages, messageStatus,
  type User, type InsertUser, type Chat, type Message, type InsertMessage, type InsertChat
} from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const VALID_INVITE_CODE = "SHADOW2024";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  verifyUser(username: string, password: string, inviteCode: string): Promise<User | null>;
  searchUsers(query: string): Promise<User[]>;
  
  // Chat operations
  createChat(data: InsertChat, creatorId: string): Promise<Chat>;
  getChatsByUserId(userId: string): Promise<any[]>;
  getChatById(chatId: string): Promise<Chat | undefined>;
  addChatMember(chatId: string, userId: string): Promise<void>;
  getChatMembers(chatId: string): Promise<User[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChatId(chatId: string, limit?: number): Promise<any[]>;
  updateMessageStatus(messageId: string, userId: string, status: string): Promise<void>;
  
  // Direct chat
  getOrCreateDirectChat(user1Id: string, user2Id: string): Promise<Chat>;
}

export class DBStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    if (insertUser.inviteCode !== VALID_INVITE_CODE) {
      throw new Error("Invalid invite code");
    }

    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const maxUserId = await db
      .select({ max: sql<number>`COALESCE(MAX(${users.userId}), 0)` })
      .from(users);
    
    const nextUserId = (maxUserId[0]?.max || 0) + 1;

    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        password: hashedPassword,
        inviteCode: insertUser.inviteCode,
        userId: nextUserId,
      })
      .returning();

    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async verifyUser(username: string, password: string, inviteCode: string): Promise<User | null> {
    if (inviteCode !== VALID_INVITE_CODE) {
      return null;
    }

    const user = await this.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    const results = await db
      .select()
      .from(users)
      .where(
        or(
          sql`${users.username} ILIKE ${`%${query}%`}`,
          sql`${users.userId}::text LIKE ${`%${query}%`}`
        )
      )
      .limit(10);
    return results;
  }

  async createChat(data: InsertChat, creatorId: string): Promise<Chat> {
    const [chat] = await db
      .insert(chats)
      .values(data)
      .returning();

    await this.addChatMember(chat.id, creatorId);
    return chat;
  }

  async getChatsByUserId(userId: string): Promise<any[]> {
    const userChats = await db
      .select({
        chat: chats,
        lastMessage: messages,
      })
      .from(chatMembers)
      .innerJoin(chats, eq(chatMembers.chatId, chats.id))
      .leftJoin(
        messages,
        and(
          eq(messages.chatId, chats.id),
          sql`${messages.id} = (SELECT id FROM ${messages} WHERE ${messages.chatId} = ${chats.id} ORDER BY ${messages.createdAt} DESC LIMIT 1)`
        )
      )
      .where(eq(chatMembers.userId, userId))
      .orderBy(desc(sql`COALESCE(${messages.createdAt}, ${chats.createdAt})`));

    const enrichedChats = await Promise.all(
      userChats.map(async ({ chat, lastMessage }) => {
        const members = await this.getChatMembers(chat.id);
        
        let chatName = chat.name;
        let otherUser = null;
        
        if (!chat.isGroup && members.length === 2) {
          otherUser = members.find(m => m.id !== userId);
          chatName = otherUser?.username || "Unknown";
        }

        return {
          ...chat,
          name: chatName,
          members,
          lastMessage,
          otherUser,
        };
      })
    );

    return enrichedChats;
  }

  async getChatById(chatId: string): Promise<Chat | undefined> {
    const [chat] = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1);
    return chat;
  }

  async addChatMember(chatId: string, userId: string): Promise<void> {
    await db.insert(chatMembers).values({ chatId, userId });
  }

  async getChatMembers(chatId: string): Promise<User[]> {
    const members = await db
      .select({ user: users })
      .from(chatMembers)
      .innerJoin(users, eq(chatMembers.userId, users.id))
      .where(eq(chatMembers.chatId, chatId));

    return members.map(m => m.user);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();

    const members = await this.getChatMembers(message.chatId);
    
    for (const member of members) {
      if (member.id !== message.senderId) {
        await db.insert(messageStatus).values({
          messageId: newMessage.id,
          userId: member.id,
          status: "delivered",
        });
      }
    }

    return newMessage;
  }

  async getMessagesByChatId(chatId: string, limit: number = 50): Promise<any[]> {
    const chatMessages = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return chatMessages.reverse().map(({ message, sender }) => ({
      ...message,
      sender,
    }));
  }

  async updateMessageStatus(messageId: string, userId: string, status: string): Promise<void> {
    await db
      .update(messageStatus)
      .set({ status, readAt: status === "read" ? new Date() : null })
      .where(
        and(
          eq(messageStatus.messageId, messageId),
          eq(messageStatus.userId, userId)
        )
      );
  }

  async getOrCreateDirectChat(user1Id: string, user2Id: string): Promise<Chat> {
    const existingChats = await db
      .select({ chat: chats })
      .from(chatMembers as any)
      .innerJoin(chats, eq((chatMembers as any).chatId, chats.id))
      .where(
        and(
          eq(chats.isGroup, false),
          eq((chatMembers as any).userId, user1Id)
        )
      );

    for (const { chat } of existingChats) {
      const members = await this.getChatMembers(chat.id);
      const memberIds = members.map(m => m.id);
      
      if (memberIds.includes(user1Id) && memberIds.includes(user2Id) && memberIds.length === 2) {
        return chat;
      }
    }

    const [newChat] = await db
      .insert(chats)
      .values({ isGroup: false })
      .returning();

    await this.addChatMember(newChat.id, user1Id);
    await this.addChatMember(newChat.id, user2Id);

    return newChat;
  }
}

export const storage = new DBStorage();
