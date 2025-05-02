import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const httpserver = createServer(app);
const io = new Server(httpserver);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

//websocket logic
io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("chat message", ( {user,msg}) => {
    io.emit("chat message", {user,msg}); //broad cost to all
  });
  socket.on("disconnect", () => {
    console.log("user is disconnect");
  });
});

httpserver.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
