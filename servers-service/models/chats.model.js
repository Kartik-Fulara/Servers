const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    messages: {
        type: String,
    },
}, {
    timestamps: true,
});

const ChatSchema = new mongoose.Schema(
    {
        chatId: {
            type: String,
            required: true
        },
        users: [{
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
            },
            messages: [MessageSchema],
        },
        ],
    },
    {
        timestamps: true,
    }
);




const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
