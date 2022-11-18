const axios = require("axios");
const addUser = async (uid, name, email) => {
    try {
        const response = await axios.post(`${process.env.CHAT_SERVER_URL}/api/addUser`, {
            uid,
            name,
            email
        });

        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

const updateUser = async (uid, name, email, username) => {
    try {
        const response = await axios.post(`${process.env.CHAT_SERVER_URL}/api/updateUser`, {
            uid,
            name,
            email,
            username
        });
        return { status: "Ok", data: response.data };
    }
    catch (error) {
        console.log(error);
        return { status: "error", error: error };
    }
}

const removeServer = async (serverId, userId) => {
    try {
        const response = await axios.post(`${process.env.CHAT_SERVER_URL}/api/leaveServer`, {
            serverId,
            userId
        });
        console.log(response);
        return { status: "Ok", data: response.data };
    }
    catch (error) {
        // console.log(error);
        return { status: "error" };
    }
}

module.exports = { addUser, updateUser, removeServer };
