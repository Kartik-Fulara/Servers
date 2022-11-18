const User = require('../models/user.model.js');
const changeUserNameToChats = async (senderId, chatId, username) => {
    try {
        const user = await User.findOne({ _id: senderId });
        const chat = user.chats.find(chat => chat.chatId === chatId);
        chat.users.username = username;
        await user.save();
        return { status: "success" };
    } catch (error) {
        console.log(error);
        return { status: "error" };
    }
}

const getUid = async (id) => {
    try {
        // find user by id
        const user = await User.findOne({ _id: id });

        return user.uid;
    } catch (error) {
        console.log(error);
        return null;
    }
};

const get_id = async (uid) => {
    try {
        // find user by id
        const user = await User.findOne({ uid: uid });
        return user._id;
    } catch /* A string that is used to store the user's id. */
    (error) {
        console.log(error);
        return null;
    }
};
module.exports = { changeUserNameToChats, getUid, get_id };
