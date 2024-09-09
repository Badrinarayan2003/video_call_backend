const express = require("express");
const { createServer } = require("http");

const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: true
});

const PORT = 5000;

app.get('/', (req, res) => {
    res.send("video calling app server")
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log(`socket connected ${socket.id}`)
    socket.on("join-room", (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        io.to(room).emit("user-Joined", { email, id: socket.id });
        socket.join(room);

        io.to(socket.id).emit("join-room", data);
    })

    socket.on("user-call", ({ to, offer }) => {
        io.to(to).emit("incoming-call", { from: socket.id, offer })
    })

    socket.on("call-accepted", ({ to, ans }) => {
        io.to(to).emit("call-accepted", { from: socket.id, ans });
    })

    socket.on("peer-nego-needed", ({ to, offer }) => {
        io.to(to).emit("peer-nego-needed", { from: socket.id, offer });
    })

    socket.on("peer-nego-done", ({ to, ans }) => {
        io.to(to).emit("peer-nego-final", { from: socket.id, ans });
    })

});



server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})