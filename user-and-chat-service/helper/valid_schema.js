const joi = require('joi');


const chatSchema = joi.object({
    name: joi.string(),
    users: joi.array().items(joi.string()),
    messages: joi.array().items(joi.string()),
    isGroupChat: joi.boolean(),
    groupAdmin: joi.string(),
    groupImage: joi.string(),
});


const messageSchema = joi.object({
    chat: joi.string(),
    sender: joi.string(),
    message: joi.string(),
    isRead: joi.boolean().default(false),
});



const userSchema = joi.object({
    uid: joi.string().required(),
    username: joi.string().required(),
    name: joi.string().required(),
    email: joi.string().required().email(),
    profileImage: joi.string(),
    chats: joi.array().items(joi.string()),
    friends: joi.array().items(joi.object({
        uid: joi.string(),
        isAccept: joi.boolean().default(false),
    })),
});


module.exports = { chatSchema, messageSchema, userSchema };
