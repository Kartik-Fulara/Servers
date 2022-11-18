const axios = require('axios');

const updateUserServer = async (uid, serverId, username) => {
    try {
        console.log(uid, serverId, username);
        const response = await axios.post(`${process.env.SERVERS_SERVER_URL}/call/updateUser`, {
            uid,
            serverId,
            username
        });
        if (response.data.message === "Username Changed") {
            return { status: "ok" };
        } else {
            return { status: "error" };
        }
    }
    catch (error) {
        return { status: "error", error: error };
    }
}

const kickFromServer = async (serverId, userId) => {
    try {
        const response = await axios.post(`${process.env.SERVERS_SERVER_URL}/call/leaveServer`, {
            serverId,
            userId
        });
        if (response.data.message === "Server Left") {
            return { status: "ok", data: response.data };
        } else {
            return { status: "error", data: "Error" };
        }
    }
    catch (error) {
        console.log(error);
        return { status: "error", error: error };
    }
};

const deleteServer = async (serverId) => {
    try {
        const response = await axios.delete(`${process.env.SERVERS_SERVER_URL}/call/deleteServer`, {
            serverId
        });
        if (response.data.message === "Server Deleted") {
            return { status: "ok" };
        } else {
            return { status: "error" };
        }
    }
    catch (error) {
        console.log(error);
        return { status: "error", error: error };
    }
}

module.exports = { updateUserServer, deleteServer, kickFromServer };
