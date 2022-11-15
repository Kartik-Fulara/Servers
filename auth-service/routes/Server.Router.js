require("dotenv").config();
const express = require("express");
const axios = require("axios");



const router = express.Router();

router.get("/getServerDetailsById", async (req, res) => {
    const { id } = req.query;
    try {
        const { data } = await axios.get(`${process.env.SERVERS_SERVER_URL}/call/getServerDetailsById?id=${id}`);
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/createServer", async (req, res) => {
    const uid = req.user;
    const { id, username, userProfileImage = "", serverName, serverImage } = req.body;
    console.log(id);
    try {
        const { data } = await axios.post(`${process.env.SERVERS_SERVER_URL}/call/createServer`, {
            id,
            serverName,
            username,
            userProfileImage,
            serverImage,
        });
        if (data.error) {
            return res.status(400).send(data);
        }
        console.log(data);
        const { serverId, serverName: SN, serverImage: SI } = data.data;
        const { data: DATA } = await axios.post(`${process.env.CHAT_SERVER_URL}/api/createServer`, {
            uid,
            serverId,
            serverName: SN,
            serverImage: SI,
        });
        if (DATA.error) {
            return res.status(400).send(DATA);
        }
        res.status(200).send({ message: "Server Created", data: data });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/getallServers", async (req, res) => {
    const uid = req.user;
    try {
        const { data } = await axios.get(`${process.env.CHAT_SERVER_URL}/api/getallServers?uid=${uid}`);
        if (data.error) {
            return res.status(400).send(data);
        }
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/runCode", async (req, res) => {
    try {
        const { data } = await axios.post(`${process.env.SERVERS_SERVER_URL}/runCode`, {
            input: req.body.input,
            code: req.body.code,
            language: req.body.language
        });
        console.log(data);
        res.status(200).send({ data: data });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/joinServer", async (req, res) => {
    const uid = req.user;
    const { serverName, serverId, serverImage, userAvatar = "", userName } = req.body;
    try {
        const { data: addInUserDB } = await axios.post(`${process.env.CHAT_SERVER_URL}/api/joinServer`, {
            uid,
            serverName,
            serverId,
            serverImage,
        });

        console.log(addInUserDB);

        const { data: addInServerDB } = await axios.post(`${process.env.SERVERS_SERVER_URL}/call/joinMember`, {
            userId: addInUserDB.id, userAvatar, userName, serverId
        });
        if (addInUserDB.error || addInServerDB.error) {
            return res.status(400).send(data);
        }
        res.status(200).send({ message: "Joined Server" });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/getServerDetailsByLink", async (req, res) => {
    const { link } = req.query;
    console.log(link);
    try {
        const { data } = await axios.get(`${process.env.SERVERS_SERVER_URL}/call/getServerDetailsByLink?link=${link}`);
        console.log(data.serverLink)
        res.status(200).send({ data: data.serverLink });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/sendMessages", async (req, res) => {
    const { chatId, message, senderId } = req.body;
    try {
        const { data } = await axios.post(`${process.env.SERVERS_SERVER_URL}/call/sendMessage`, {
            chatId,
            message,
            Suid: senderId
        });

        res.send({ status: "Ok", data: data });
    } catch (err) {
        res.status(400).send({ status: "Error", message: "Error while sending message" });
    }

});

router.get("/getServerChatByServerId", async (req, res) => {
    const { serverId } = req.query;
    try {
        const { data } = await axios.get(`${process.env.SERVERS_SERVER_URL}/call/getServerChatByServerId?serverId=${serverId}`);
        res.status(200).send({ status: "Ok", data: data });
    } catch (err) {
        console.log(err);
        res.send({ status: "Error", message: "Error while sending message" });
    }
});
module.exports = router;
