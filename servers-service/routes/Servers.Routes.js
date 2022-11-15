const express = require("express");
const Server = require("../models/servers.model.js");
const Chat = require("../models/chats.model.js");

const router = express.Router();
const { nanoid } = require("nanoid");

router.post("/createServer", async (req, res) => {
    const { id, username, userProfileImage, serverName, serverImage } = req.body;
    console.log(req.body);
    try {
        const serverId = nanoid(50);

        const channelChatId = nanoid(50);
        const channelCollabId = nanoid(50);

        const channels = [{
            channelId: channelChatId,
            channelType: "chat",
            channelName: `${serverName} Chat Area`
        }, {
            channelId: channelCollabId,
            channelType: "collab",
            channelName: `${serverName} Collab Area`
        }];

        const firstLink = nanoid(40);

        const serverLinks = [
            firstLink
        ];

        const server = new Server({
            serverId,
            serverName,
            serverImage,
            serverLinks,
            channels: [
                {
                    channelId: channels[0].channelId,
                    channelType: channels[0].channelType,
                    channelName: channels[0].channelName
                },
                {
                    channelId: channels[1].channelId,
                    channelType: channels[1].channelType,
                    channelName: channels[1].channelName
                }
            ],
            members: [
                {
                    userId: id,
                    userName: username,
                    userAvatar: userProfileImage
                }
            ],
            Owner: `${id}`,
            currentHost: `${id}`
        });

        const chat = new Chat({
            chatId: serverId,
            users: []
        });

        await chat.save();

        const serverData = await server.save();
        res.status(200).send({ message: "Server Created", data: serverData });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "error" });
    }
});

router.get("/getServerDetailsById", async (req, res) => {
    const { id } = req.query;
    try {
        console.log(id);
        const server = await Server.findOne({ serverId: id });
        if (server) {
            res.status(200).send({ message: "Server Found", server });
        }
        else {
            res.status(404).send({ message: "Server Not Found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "error" });
    }
});

router.post("/joinMember", async (req, res) => {
    const { userId, userAvatar, userName, serverId } = req.body;
    console.log(userId, userAvatar, userName, serverId);
    try {
        const server = await Server.findOne({ serverId: serverId });
        if (server) {
            server.members.push({
                userId: userId,
                userName: userName,
                userAvatar: userAvatar
            });
            server.save((err, server) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                res.status(200).send({ message: "Member Joined", server });
            });
        }
        else {
            res.status(404).send({ message: "Server Not Found" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: "error" });
    }
});

router.get('/getServerDetailsByLink', async (req, res) => {
    const { link } = req.query;
    console.log(link);
    try {
        const serverLink = await Server.findOne({ serverLinks: link });
        console.log(serverLink);
        if (serverLink) {
            res.status(200).send({ message: "Server Found", serverLink });
        }
        else {
            res.status(404).send({ message: "Server Not Found" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: "error" });
    }
});

router.post("/sendMessage", async (req, res, next) => {
    try {
        console.log(req.body);
        const { chatId, message, Suid } = req.body;
        if (!chatId || !message || !Suid) {
            return res.status(400).send({ message: "Bad request" });
        }
        const chat = await Chat.findOne({ chatId: chatId });
        if (!chat) {
            res.status(400).send({ message: "Chat not found" });
            return;
        }
        const updatedChat = await Chat.findOneAndUpdate(
            { chatId: chatId },
            {
                $push: {
                    users: {
                        senderId: Suid,
                        messages: {
                            messages: message,
                        },
                    }
                }
            },
            { new: true }
        );
        const ret = await updatedChat.save();
        const retMessage = ret.users[ret.users.length - 1];
        res.status(200).send({ data: retMessage, message: "Message added" });
    }
    catch (error) {
        next(error);
    }
});

router.get("/getServerChatByServerId", async (req, res) => {
    const { serverId } = req.query;
    try {
        const server = await Chat.findOne({ chatId: serverId });
        if (server) {
            res.status(200).send({ message: "Server Found", server });
        }
        else {
            res.status(404).send({ message: "Server Not Found" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: "error" });
    }
});

router.post('/changeHost', async (req, res) => {
    const { serverId, userID } = req.body;
    try {
        const server = await Server.findOne({ serverId: serverId });
        if (server) {
            server.currentHost = userID;
            await server.save();
            res.status(200).send({ message: "Host Changed", userID });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "error" });
    }
});


router.post("/removeMember", async (req, res) => {
    const { serverId, userId } = req.body;
    try {
        const server = await Server.findOne({ serverId: serverId });
        if (server) {
            const members = server.members;
            const newMembers = members.filter(member => member.userId !== userId);
            server.members = newMembers;
            await server.save();
            res.status(200).send({ message: "Member Removed", newMembers });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "error" });
    }
})

router.delete('/deleteServer', async (req, res) => {
    const { serverId } = req.body;
    try {
        const server = await Server.findOne({ serverId: serverId });
        if (server) {
            await server.delete();
            res.status(200).send({ message: "Server Deleted" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "error" });
    }
});

module.exports = router;
