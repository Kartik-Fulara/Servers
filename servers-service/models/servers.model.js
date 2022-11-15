const mongoose = require("mongoose");


const MessageSchema = new mongoose.Schema({
    messages: {
        type: String,
    },
}, {
    timestamps: true,
});


const ServerSchema = new mongoose.Schema(
    {
        serverId: {
            type: String,
            required: true
        },
        serverLinks: [{
            type: String,
        }],
        channels: [{
            id: {
                type: String,
            },
            channelId: {
                type: String,
            },
            channelType: {
                type: String
            },
            channelName: {
                type: String
            },
            channelChats: [{
                senderId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                messages: [MessageSchema],
            }],
        },
        ],
        serverName: {
            type: String,
            required: true
        },
        serverImage: {
            type: String,
        },
        Owner: {
            type: String,
        },
        currentHost: {
            type: String,
        },
        members: [{
            userId: {
                type: String
            },
            userName: {
                type: String
            },
            userAvatar: {
                type: String
            },
        }],
    },
    {
        timestamps: true,
    }
);

const Server = mongoose.model("Server", ServerSchema);

module.exports = Server;
