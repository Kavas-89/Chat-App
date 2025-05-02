import express from "express";
import path, { dirname, join } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import formatmessage from "./utils/messages.js";
import {
  getcurrentuser,
  userjoin,
  getroomuser,
  userleave,
} from "./utils/users.js";

dotenv.config();

const app = express();
const httpserver = http.createServer(app);
const io = new Server(httpserver);
const PORT = process.env.PORT;
//path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
const botname = "mama";
//websocket logic
io.on("connection", (socket) => {
  socket.on("joinroom", ({ username, room }) => {
    const user = userjoin(socket.id, username, room);
    socket.join(user.room);

    //welcome to all msg
    socket.emit("message", formatmessage(botname, "Welcome to the chat"));
    //broadcast when a user connect
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatmessage(botname, `${user.username}  has join the chat`)
      );

    //send user and room info
    io.to(user.room).emit("roomusers", {
      room: user.room,
      users: getroomuser(user.room),
    });
  });

  //listen for chat message
  socket.on("chatMessage", (msg) => {
    const user = getcurrentuser(socket.id);
    console.log(msg);
    io.to(user.room).emit("message", formatmessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userleave(socket.id);
    if (user) {
      console.log(`${user.username}   has left the chat`);
      io.to(user.room).emit(
        "message",
        formatmessage(botname, `${user.username}  left the chat`)
      );
      io.to(user.room).emit("roomusers", {
        room: user.room,
        users: getroomuser(user.room),
      });
    }
  });
});

//port
httpserver.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
