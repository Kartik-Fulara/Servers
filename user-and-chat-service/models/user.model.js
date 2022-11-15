const mongoose = require('mongoose');
const { nanoid } = require("nanoid");

const UserSchema = new mongoose.Schema({

    uid: {
        type: String,
        required: true,
        unique: true,
    },

    username: {
        type: String,
        default: () => nanoid(30),
        unique: true,
        maxLength: 30,
    },

    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    profileImage: {
        type: String,
    },

    chats: [
        {
            users: {
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                username: String,
                profileImage: String,
            },
            chatId: {
                type: String,
            }
        },

    ],

    friends: [
        {
            friend: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            username: {
                type: String,
            },
            profileImage: {
                type: String,
            },
            isAccept: {
                type: Boolean,
                default: false,
            },
            isDecline: {
                type: Boolean,
                default: false,
            },
            isReq: {
                type: Boolean,
                default: false,
            },
            sendBy: {
                type: String,
            }
        },
    ],
    servers: [{
        serverId: {
            type: String,
        },
        serverName: {
            type: String,
        },
        serverImage: {
            type: String,
        }
    }],
}, {
    timestamps: true,
}, { typeKey: '$type' }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
