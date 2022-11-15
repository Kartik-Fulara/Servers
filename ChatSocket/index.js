let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http, {
    cors: {
        origin: "*",
    }
});

let activeUsers = [];

const addUser = (userId, socketId) => {
    !activeUsers.some((user) => user.userId === userId) ? activeUsers.push({ userId, socketId }) : null;
};

const removeUser = (socketId) => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    console.log(userId);
    return activeUsers.find((user) => user.userId === userId);
};


io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('login', (data) => {
        addUser(data, socket.id);
        console.log(activeUsers)
        io.emit('login', activeUsers);
    });

    socket.on("sendMessage", (data) => {
        const { receiverId } = data;
        const user = getUser(receiverId);
        if (user !== undefined) {
            io.to(user.socketId).emit("getMessage", {
                data
            });
        }
    });

    socket.on("sendRequest", (data) => {
        console.log("data", data)
        const { receiverId, reqData } = data;
        const user = getUser(receiverId);
        if (user !== undefined) {
            io.to(user.socketId).emit("getRequest", {
                reqData
            });
        }
    });

    socket.on("rejectRequest", (data) => {
        console.log("data", data)
        const { receiverId, rejData } = data;
        let id;
        if (typeof receiverId === "string") {
            id = receiverId;
        } else {
            id = receiverId.friendId;
        }
        const user = getUser(id);
        if (user !== undefined) {
            console.log("user", user);
            io.to(user.socketId).emit("getReject", {
                rejData
            });
        }
    });

    socket.on("cancelRequest", (data) => {
        console.log("data", data)
        const { receiverId, rejData } = data;
        let id;
        if (typeof receiverId === "string") {
            id = receiverId;
        } else {
            id = receiverId.friendId;
        }
        const user = getUser(id);
        if (user !== undefined) {
            console.log("user", user);
            io.to(user.socketId).emit("getCancel", {
                rejData
            });
        }
    });

    socket.on("acceptRequest", (data) => {
        const { receiverId, accData } = data;
        let id;
        if (typeof receiverId === "string") {
            id = receiverId;
        } else {
            id = receiverId.friendId;
        }
        const user = getUser(id);
        if (user !== undefined) {
            io.to(user.socketId).emit("getAccept", {
                accData
            });
        }
    });

    socket.on("removeFrnd", (data) => {
        const { receiverId, removeData } = data;
        console.log(data);
        let id;
        if (typeof receiverId === "string") {
            id = receiverId;
        } else {
            id = receiverId.friendId;
        }
        const user = getUser(id);
        if (user !== undefined) {
            io.to(user.socketId).emit("getRemove", {
                removeData
            });
        }
    });


    socket.on("logout", (data) => {
        console.log(data);
        removeUser(socket.id);
        io.emit('logout', activeUsers);
    });

    socket.on('connect_failed', function () {
        io.to(socket.id).emit("error", { error: "Sorry, there seems to be an issue with the connection!" });
    });

    socket.on('disconnect', () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        console.log(activeUsers)
        io.emit('logout', activeUsers);
    });
});

app.get('/', (req, res) => {
    res.send("Welcome to Coders Park Chat Socket Area")
});

let server_port = process.env.PORT || process.env.YOUR_PORT || 9654;

http.listen(server_port, () => {
    console.log('listening on port : ' + server_port);
});
/* This is a route that is used to test if the server is running. */
