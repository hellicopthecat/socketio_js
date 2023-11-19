const socket = io();

const roomCont = document.getElementById("roomCont");
const nickForm = document.getElementById("nickForm");
const msgForm = document.getElementById("msgForm");
const roomForm = document.getElementById("roomForm");
const roomField = document.getElementById("roomField");
const nickField = document.getElementById("nickField");
const msgField = document.getElementById("msgField");
const chatCont = document.getElementById("chatCont");
const chat = document.getElementById("chat");

let room;

function msgCreate(msg) {
  const li = document.createElement("li");
  li.innerText = msg;
  if (li.innerText.includes("You")) {
    li.style.color = "red";
    li.style.listStyle = "none";
  } else {
    li.style.color = "blue";
    li.style.textAlign = "right";
    li.style.listStyle = "none";
  }
  chat.appendChild(li);
  chatCont.scrollTo(0, chatCont.scrollHeight);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  socket.emit("enter_room", {roomname: roomField.value});
  msgCreate("You are join this room");
  room = roomField.value;
  roomField.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  if (nickField.value.match(/[you]|[YOU]/g)) {
    nickField.setAttribute(
      "placeholder",
      "The word 'you' cannot be used as a nickname."
    );
    nickField.value = "ANONY";
  } else {
    nickField.setAttribute("placeholder", "Change nickname.");
  }
  socket.emit("nickname", {nick: nickField.value});
  nickField.value = "";
}

function handleMsgSubmit(event) {
  event.preventDefault();
  const msgText = msgField.value;
  if (msgText === "") {
  }
  socket.emit("msg_send", {msg: msgField.value, roomname: room}, () => {
    msgCreate(`You: ${msgText}`);
  });
  msgField.value = "";
}
roomForm.addEventListener("submit", handleRoomSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
msgForm.addEventListener("submit", handleMsgSubmit);

socket.on("welcome", () => {
  msgCreate("Someone Joined Chat Room");
});
socket.on("bye", () => {
  msgCreate("Someone disconnected");
});
socket.on("receive_msg", (msg) => {
  msgCreate(msg);
});
socket.on("room_created", (createdRooms) => {
  const ul = roomCont.querySelector("ul");
  ul.innerHTML = "";
  if (createdRooms.length === 0) {
    return;
  }
  createdRooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    ul.appendChild(li);
  });
});
