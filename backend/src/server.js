const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { createApp } = require("./app");
const { connectDb } = require("./config/db");


const Message = require("./models/Message");
const { Task } = require("./models/Task");
const { Request } = require("./models/Request");
const { Notification } = require("./models/Notification");
const { User } = require("./models/User");

function safeName(user) {
  if (!user) return "Someone";
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  return user.first_name || "Someone";
}

function formatMessagePayload(messageDoc) {
  if (!messageDoc) return null;
  return {
    _id: String(messageDoc._id),
    taskId: messageDoc.taskId,
    senderId: messageDoc.senderId,
    text: messageDoc.text,
    time: messageDoc.time,
    editedAt: messageDoc.editedAt || null,
    reactions: Array.isArray(messageDoc.reactions) ? messageDoc.reactions : [],
    createdAt: messageDoc.createdAt,
    updatedAt: messageDoc.updatedAt,
  };
}

async function emitToTaskRecipients(io, taskId, senderId, eventName, data) {
  if (!taskId) return;
  try {
    const [task, acceptedRequests] = await Promise.all([
      Task.findById(taskId).lean(),
      Request.find({ task: taskId, status: "accepted" }).lean(),
    ]);

    if (!task) return;

    const recipientIds = new Set();
    if (task.createdBy && String(task.createdBy) !== String(senderId)) {
      recipientIds.add(task.createdBy);
    }

    for (const req of acceptedRequests || []) {
      if (req.helper && String(req.helper) !== String(senderId)) {
        recipientIds.add(req.helper);
      }
    }

    // Emit to specific user rooms (global listeners)
    for (const userId of recipientIds) {
      io.to(`user:${userId}`).emit(eventName, data);
    }
  } catch (err) {
    console.error(`❌ Error emitting ${eventName} to recipients:`, err);
  }
}

async function main() {
  try {
    await connectDb(process.env.MONGO_URI);

    const app = createApp();
    const port = Number(process.env.PORT || 5000);

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);

      const initialUserId = socket.handshake?.auth?.userId || socket.handshake?.query?.userId;
      if (initialUserId) {
        socket.data.userId = initialUserId;
        socket.join(`user:${initialUserId}`);
      }

      socket.on("register_user", (userId) => {
        if (!userId) return;
        socket.data.userId = userId;
        socket.join(`user:${userId}`);
      });

      // JOIN ROOM
      socket.on("join_task_room", (taskId) => {
        const room = `task:${taskId}`;
        socket.join(room);
        console.log(`📡 ${socket.id} joined ${room}`);
      });

      // SEND MESSAGE 
      socket.on("send_task_message", async (data) => {
        const senderId = socket.data.userId || data.senderId;
        const taskId = data?.taskId;
        const messageText = String(data?.text || "").trim();

        if (!senderId || !taskId || !messageText) {
          return;
        }

        const room = `task:${taskId}`;
        console.log("📩 Message:", data);

        let savedMessage = null;

        // SAVE TO MONGODB
        try {
          savedMessage = await Message.create({
            taskId,
            senderId,
            text: messageText,
            time: data.time || new Date().toLocaleTimeString(),
          });
        } catch (err) {
          console.error("❌ DB Save Error:", err);
        }

        // Notify other participants (task owner / accepted helper) via user rooms.
        try {
          const [task, acceptedRequests, sender] = await Promise.all([
            Task.findById(taskId).lean(),
            Request.find({ task: taskId, status: "accepted" }).lean(),
            User.findOne({ id: senderId }).select("first_name last_name").lean(),
          ]);

          if (task) {
            const recipientIds = new Set();
            if (task.createdBy && task.createdBy !== senderId) {
              recipientIds.add(task.createdBy);
            }

            for (const req of acceptedRequests || []) {
              if (req.helper && req.helper !== senderId) {
                recipientIds.add(req.helper);
              }
            }

            const senderName = safeName(sender);
            const notificationDocs = [];

            for (const userId of recipientIds) {
              notificationDocs.push({
                userId,
                message: `${senderName} sent a message on "${task.title}"`,
                taskId: task._id,
                read: false,
              });

              io.to(`user:${userId}`).emit("chat:new_message", {
                taskId,
                senderId,
                senderName,
                text: messageText,
                taskTitle: task.title,
                createdAt: new Date().toISOString(),
              });
            }

            if (notificationDocs.length > 0) {
              await Notification.insertMany(notificationDocs);
            }
          }
        } catch (err) {
          console.error("❌ Notification emit/save error:", err);
        }

        if (savedMessage) {
          io.to(room).emit("receive_task_message", formatMessagePayload(savedMessage));
        }
      });

      // EDIT MESSAGE
      socket.on("edit_task_message", async (data) => {
        const senderId = socket.data.userId || data?.senderId;
        const messageId = data?.messageId;
        const nextText = String(data?.text || "").trim();

        if (!senderId || !messageId || !nextText) return;

        try {
          const message = await Message.findById(messageId);
          if (!message) return;
          if (message.senderId !== senderId) return;

          message.text = nextText;
          message.editedAt = new Date();
          await message.save();

          io.to(`task:${message.taskId}`).emit(
            "task_message_updated",
            formatMessagePayload(message)
          );
        } catch (err) {
          console.error("❌ Edit message error:", err);
        }
      });

      // DELETE MESSAGE
      socket.on("delete_task_message", async (data) => {
        const senderId = socket.data.userId || data?.senderId;
        const messageId = data?.messageId;

        if (!senderId || !messageId) return;

        try {
          const message = await Message.findById(messageId).lean();
          if (!message) return;
          if (message.senderId !== senderId) return;

          await Message.deleteOne({ _id: messageId });

          io.to(`task:${message.taskId}`).emit("task_message_deleted", {
            messageId: String(messageId),
            taskId: message.taskId,
          });
        } catch (err) {
          console.error("❌ Delete message error:", err);
        }
      });

      // REACT TO MESSAGE (only one reaction per user per message)
      socket.on("react_task_message", async (data) => {
        const userId = socket.data.userId || data?.userId;
        const messageId = data?.messageId;
        const emoji = String(data?.emoji || "").trim();

        if (!userId || !messageId || !emoji) return;

        try {
          const message = await Message.findById(messageId);
          if (!message) return;

          // Reactions are allowed only on other users' messages.
          if (message.senderId === userId) return;

          if (!Array.isArray(message.reactions)) {
            message.reactions = [];
          }

          const existingIndex = message.reactions.findIndex((r) => r.userId === userId);

          // Same emoji click toggles off, different emoji replaces previous reaction.
          if (existingIndex >= 0) {
            if (message.reactions[existingIndex].emoji === emoji) {
              message.reactions.splice(existingIndex, 1);
            } else {
              message.reactions[existingIndex].emoji = emoji;
            }
          } else {
            message.reactions.push({ userId, emoji });
          }

          await message.save();

          io.to(`task:${message.taskId}`).emit(
            "task_message_updated",
            formatMessagePayload(message)
          );
        } catch (err) {
          console.error("❌ React message error:", err);
        }
      });

      // WEBRTC SIGNALING FOR CALLS
      socket.on("webrtc_offer", async (data) => {
        socket.to(`task:${data.taskId}`).emit("webrtc_offer", data);
        const senderId = socket.data.userId || data?.senderId;
        await emitToTaskRecipients(io, data.taskId, senderId, "webrtc_offer", data);
      });

      socket.on("webrtc_answer", async (data) => {
        socket.to(`task:${data.taskId}`).emit("webrtc_answer", data);
        const senderId = socket.data.userId || data?.senderId;
        await emitToTaskRecipients(io, data.taskId, senderId, "webrtc_answer", data);
      });

      socket.on("webrtc_ice_candidate", async (data) => {
        socket.to(`task:${data.taskId}`).emit("webrtc_ice_candidate", data);
        const senderId = socket.data.userId || data?.senderId;
        await emitToTaskRecipients(io, data.taskId, senderId, "webrtc_ice_candidate", data);
      });

      socket.on("end_call", async (data) => {
        socket.to(`task:${data.taskId}`).emit("end_call", data);
        const senderId = socket.data.userId || data?.senderId;
        await emitToTaskRecipients(io, data.taskId, senderId, "end_call", data);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
      });
    });

    server.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Server error:", err);
  }
}

main();