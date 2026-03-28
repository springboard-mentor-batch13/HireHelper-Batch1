import { io } from "socket.io-client";

let socket;

function getCurrentUserId() {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed?._id || parsed?.id || parsed?.userId || localStorage.getItem("userId");
    }
  } catch {
    // ignore malformed storage
  }
  return localStorage.getItem("userId");
}

export const getSocket = () => {
  const userId = getCurrentUserId();

  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: { userId },
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      const currentUserId = getCurrentUserId();
      if (currentUserId) {
        socket.emit("register_user", currentUserId);
      }
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket error:", err.message);
    });
  } else if (socket.auth?.userId !== userId) {
    socket.auth = { userId };
    if (socket.connected && userId) {
      socket.emit("register_user", userId);
    } else if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
};