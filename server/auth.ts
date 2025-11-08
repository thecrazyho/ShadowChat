import { randomUUID } from "crypto";

interface Session {
  userId: string;
  createdAt: Date;
}

const sessions = new Map<string, Session>();

const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(userId: string): string {
  const sessionToken = randomUUID();
  sessions.set(sessionToken, {
    userId,
    createdAt: new Date(),
  });
  return sessionToken;
}

export function getSession(token: string): Session | null {
  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  const now = Date.now();
  const sessionAge = now - session.createdAt.getTime();
  
  if (sessionAge > SESSION_EXPIRY) {
    sessions.delete(token);
    return null;
  }

  return session;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}

export function cleanupExpiredSessions(): void {
  const now = Date.now();
  const tokensToDelete: string[] = [];
  
  sessions.forEach((session, token) => {
    const sessionAge = now - session.createdAt.getTime();
    if (sessionAge > SESSION_EXPIRY) {
      tokensToDelete.push(token);
    }
  });
  
  tokensToDelete.forEach(token => sessions.delete(token));
}

setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
