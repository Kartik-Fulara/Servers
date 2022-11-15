// all Routes
// chat controllers


const express = require("express");
const { Chat } = require("../models/chat.model.js");
const User = require("../models/user.model.js");

// get all chats of specific user

const addMessage = async (req, res, next) => {
    try {
        const { chatId, message, Suid } = req.body;
        if (!chatId || !message || !Suid) {
            return res.status(400).send({ message: "Bad request" });
        }
        const chat = await User.findOne({ uid: Suid, chats: { $elemMatch: { chatId: chatId } } });
        if (!chat) {
            res.status(400).send({ message: "Chat not found" });
            return;
        }
        const updatedChat = await Chat.findOneAndUpdate(
            { chatId: chatId },
            {
                $push: {
                    users: {
                        senderId: chat._id,
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
};

// get all the conversation of current chatId

const getMessage = async (req, res, next) => {

    try {

        const { chatId } = req.query;

        if (!chatId) {

            return res.status(400).send({ message: "Bad request" });

        }

        const chat = await Chat.findOne({ chatId: chatId });

        if (!chat) {

            return res.status(400).send({ message: "Chat not found" });

        }

        res.status(200).send(chat);

    }

    catch (error) {

        next(error);

    }

};


const router = express.Router();

// add new messages to current chat

router.post("/sendMessage", addMessage);

router.get("/getConversation", getMessage);



module.exports = router;
