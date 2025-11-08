import { io, Socket } from "socket.io-client";
import { getSessionToken } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = getSessionToken();
    socket = io({
      autoConnect: false,
      auth: {
        token,
      },
    });
  }
  return socket;
}

export function connectSocket() {
  const token = getSessionToken();
  if (!token) {
    console.error("Cannot connect socket: no session token");
    return null;
  }

  const socket = getSocket();
  socket.auth = { token };
  socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
