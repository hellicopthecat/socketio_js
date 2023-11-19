import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms() {
  const publicRooms = [];
  const {
    sockets: {
      adapter: {rooms, sids},
    },
  } = wsServer;
  rooms.forEach((_, roomname) => {
    if (sids.get(roomname) === undefined) {
      publicRooms.push(roomname);
    }
  });
  return publicRooms;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "ANONY";
  socket.onAny((e) => {});
  socket.on("enter_room", ({roomname}) => {
    socket.join(roomname);
    socket.to(roomname).emit("welcome");
    wsServer.sockets.emit("room_created", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_created", publicRooms());
  });
  socket.on("msg_send", ({msg, roomname}, incomming) => {
    socket.to(roomname).emit("receive_msg", `${socket["nickname"]} : ${msg}`);
    incomming();
  });
  socket.on("nickname", ({nick}) => {
    socket["nickname"] = nick;
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
