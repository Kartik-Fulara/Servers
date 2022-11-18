let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http, {
    cors: {
        origin: "*",
    }
});

const users = [];

// Join user to chat
function userJoin(id, username, room, personId) {
    const user = { id, username, room, personId };

    console.log(user);
    // check weather the user is already joined
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users.splice(index, 1);
    }
    users.push(user);

    return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        const ret = users.splice(index, 1);
        console.log(users);
        console.log(ret);
        return ret[0];
    } else {
        return null;
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}



// Run when client connects
io.on("connection", (socket) => {
    console.log("New WS Connection...");


    socket.on("joinRoom", (data) => {
        console.log(socket.id);
        console.log(data);
        const { serverId, id, userName } = data;
        const user = userJoin(socket.id, userName, serverId, id);

        if (user) {

        socket.join(user.room);

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            data: data.members
        });
        }
    });

    socket.on("leaveRoom", (data) => {
        console.log(data);
        const user = userLeave(socket.id);
        if (user) {
            socket.leave(user.room);
            io.to(user.room).emit("roomUsers", {
                data
            });
        }
    })

    socket.on("changeHost", (data) => {
        console.log(data);
        const { host, serverId } = data;
        io.to(serverId).emit("changeHost", host);
    });

    socket.on("shareOutput", (output) => {
        console.log(output);
        const user = getCurrentUser(socket.id);
        if (user !== undefined) {
        io.to(user.room).emit("shareOutput", output);
        }
    });

    socket.on("shareInput", (input) => {
        console.log(input);
        const user = getCurrentUser(socket.id);
        if (user !== undefined) {
        io.to(user.room).emit("shareInput", input);
        }
    });

    socket.on("shareLanguage", (data) => {
        console.log(data);
        const user = getCurrentUser(socket.id);
        if (user !== undefined) {
            io.to(user.room).emit("shareLanguage", data);
        }
    });


    socket.on("codeShare", (code) => {
        const user = getCurrentUser(socket.id);
        console.log(code);
        if (user != undefined) {
            io.to(user.room).emit("codeShare", code);
        }
    });

    socket.on("syncCode", (code) => {
        const user = getCurrentUser(socket.id);
        console.log(code);
        if (user != undefined) {
            io.to(user.room).emit("syncCode", code);
        }
    });


    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        /* Logging the message to the console. */
        console.log(msg);
        console.log("user", user);
        if (user !== undefined && user !== null) {
            io.to(user.room).emit("message", msg);
        }
    });

    socket.on("leaveRoom", () => {
        const user = userLeave(socket.id);
        if (user !== null) {
            socket.leave(user.room);
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    })

    socket.on('connect_failed', function () {
        const user = getCurrentUser(socket.id);
        if (user !== undefined && user !== null) {
            io.to(user.room).emit("room-error", { error: "Sorry, there seems to be an issue with the connection!" });
        }
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
        console.log("User Disconnect")
        const user = userLeave(socket.id);
        if (user !== null) {
            socket.leave(user.room);
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

// Runs when client disconnects

// create a / route
app.get('/', (req, res) => {
    res.send('Welcome to Coders Parks Channel Socket Area');
});


let server_port = process.env.PORT || process.env.YOUR_PORT || 5000;

http.listen(server_port, () => {
    console.log('listening on port : ' + server_port);
});
