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
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
};
