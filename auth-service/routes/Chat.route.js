const express = require("express");
const axios = require("axios");
const checkPassword = require("../middleware/passwordCheck.js");
const router = express.Router();
const User = require("../models/User.model.js");
router.get("/getId", async (req, res) => {
    const uid = req.user;
    try {
        const { data } = await axios.get(`${process.env.CHAT_SERVER_URL}/api/getId?uid=${uid}`);
        if (data.error) {
            return res.status(400).send(data);
        }
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
    }
});

router.post("/add-friends", async (req, res) => {
    const uid = req.user;
    const { friendId } = req.query;
    console.log(uid, friendId);
    try {
        const response = await axios.post(`${process.env.CHAT_SERVER_URL}/api/add-friends`, {
            uid,
            friendId
        });
        res.status(200).send(response.data);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Something Problem" });
    }
});

router.get("/getAllFriends", async (req, res) => {
    const uid = req.user;
    try {
        const response = await axios.get(`${process.env.CHAT_SERVER_URL}/api/getAllFriends?uid=${uid}`);
        res.status(200).send(response.data);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Something Problem" });
    }
});

router.get("/getPendingFriends", async (req, res) => {
    const uid = req.user;
    try {
        const response = await axios.get(`${process.env.CHAT_SERVER_URL}/api/getPendingFriends?uid=${uid}`);
        res.status(200).send(response.data);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Something Problem" });
    }
});

router.post("/startChat", async (req, res) => {
    const uid = req.user;
    const { friendId } = req.body;

    try {
        const response = await axios.post(`${process.env.CHAT_SERVER_URL}/api/startChat`, {
            uid,
            friendId

        });

        const data = response.data;

        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Something Problem" });
    }
});

router.get("/getUserInfo", async (req, res) => {
    const uid = req.user;
    try {
        const { data } = await axios.get(`${process.env.CHAT_SERVER_URL}/api/getUserInfo?uid=${uid}`);
        res.send({ status: "Ok", data: data });
    } catch (err) {
        console.log(err)
        res.send({ status: "Error", message: "Error while fetching user info" });
    }
});

router.get("/getChats", async (req, res) => {
    const uid = req.user;
    try {
        const { data } = await axios.get(`${process.env.CHAT_SERVER_URL}/api/getChats?uid=${uid}`);

        res.send({ status: "Ok", data: data });
        return;
    } catch (err) {
        console.log(err)
        res.send({ status: "Error", message: "Error while fetching user chats" });
        return;
    }
});

router.get("/queryUserById", async (req, res) => {
    const { id } = req.query;
    try {
        const { data } = await axios.get(`${process.env.CHAT_SERVER_URL}/api/searchUser?id=${id}`);

        res.send({ status: "Ok", data: data });
    } catch (err) {
        console.log(err)
        res.send({ status: "Error", message: "Error while fetching user info" });
    }
});

router.get("/queryUserByUserName", async (req, res) => {
    const { username } = req.query;
    try {
        const { data } = await axios.get(`${process.env.CHAT_SERVER_URL}/api/searchUser?username=${username}`);

        res.send({ status: "Ok", data: data });
    } catch (err) {
        res.send({ status: "Error", message: "Error while fetching user info" });
    }
});

router.post("/changeUserName", async (req, res) => {

    const { username, pass } = req.body;

    const uid = req.user;

    try {
        console.log(pass, uid);
        // check weather is password is correct or not
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const auth = await checkPassword(pass, user.password);
        if (!auth) {
            res.send({ status: "Error", message: "Incorrect Password" });
            return;
        }
        const { data } = await axios.post(`${process.env.CHAT_SERVER_URL}/api/changeUserName`, { username, uid });
        res.send({ status: "Ok", data: data });
        return;
    } catch (err) {
        console.log(err)
        if (err.response.data === undefined) {
            res.send({ status: "Error", message: "Error while changing username" });
            return;
        }
        if (err !== undefined && err.response.data !== undefined && err.response.data.message === "Username already taken") {
            console.log("Coming here");
            res.send({ status: "Error", message: "Username already taken" });
            return;
        } else {
            res.send({ status: "Error", message: "Error while changing username" });
        return;
        }
    }
});

router.get("/messages", async (req, res) => {

    const { chatId } = req.query;

    try {

        const { data } = await axios.get(`${process.env.CHAT_SERVER_URL}/api/getConversation?chatId=${chatId}`);

        if (data) {
            res.send({ status: "Ok", data: data });
            return;
        }
        else {
            res.send({ status: "Error", message: "Error while fetching messages" });
            return;
        }

    } catch (err) {
        res.send({ status: "Error", message: "Error while fetching user chats" });
    }
});

router.post("/sendMessages", async (req, res) => {
    const { chatId, message, senderId } = req.body;
    try {
        const { data } = await axios.post(`${process.env.CHAT_SERVER_URL}/api/sendMessage`, {
            chatId,
            message,
            Suid: senderId
        });

        res.send({ status: "Ok", data: data });
    } catch (err) {
        res.send({ status: "Error", message: "Error while sending message" });
    }

});

router.put("/acceptFriend", async (req, res) => {
    const { friendId } = req.body;
    const uid = req.user;
    console.log(uid, friendId);
    try {
        const { data } = await axios.put(`${process.env.CHAT_SERVER_URL}/api/acceptFriend`, {
            uid,
            friendId
        });
        console.log(data)
        res.status(200).send({ status: "Ok", data: data });
    } catch (err) {
        console.log(err.response.data);
        res.status(404).send({ status: "Error", message: "Error while acceptFriend friends request" });
    }
});

router.put("/rejectFriend", async (req, res) => {
    const { friendId } = req.body;
    const uid = req.user;
    console.log("fId", friendId);
    console.log("uId", uid)
    try {
        const { data } = await axios.put(`${process.env.CHAT_SERVER_URL}/api/rejectFriend`,
            {
                uid,
                friendId
            });
        console.log(data);
        res.send({ status: "Ok", data: data });
    } catch (err) {
        res.send({ status: "Error", message: "Error while rejecting friends request" });
    }
});

router.delete("/removeFriend", async (req, res) => {
    const { friendId } = req.body;
    const uid = req.user;
    console.log(friendId);
    console.log(uid)
    try {
        const { data } = await axios.delete(`${process.env.CHAT_SERVER_URL}/api/removeFriend`, {
            data: {
                uid,
                friendId
            }
        });
        console.log(data);
        res.send({ status: "Ok", data: data });
    } catch (err) {
        console.log(err.response);
        res.status(400).send({ status: "Error", message: "Error while remove friends request" });
    }
});

router.delete("/deleteReq", async (req, res) => {
    const uid = req.user;
    const { friendId } = req.body;
    console.log("uID", uid, "fID", friendId);
    try {
        const { data } = await axios.delete(`${process.env.CHAT_SERVER_URL}/api/deleteReq`, {
            data: {
                uid,
                friendId
            },
        });
        res.send({ status: "Ok", data: data });
    } catch (err) {
        res.send({ status: "Error", message: "Error while delete friends request" });
    }
});

router.get("/getUserChat", async (req, res) => {
    const uid = req.user;
    try {
        const { data } = await axios.get(`${process.env.CHAT_SERVER_URL}/api/getUserChat?uid=${uid}`);
        res.send({ status: "Ok", data: data });
    } catch (err) {
        res.send({ status: "Error", message: "Error while fetching user chat" });
    }
})

module.exports = router;
