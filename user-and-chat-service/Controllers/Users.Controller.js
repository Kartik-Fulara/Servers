const Error = require("http-errors");
const User = require("../models/user.model.js");
const mongoose = require('mongoose');
const { Chat } = require("../models/chat.model.js");
const { nanoid } = require("nanoid");



const addUser = async (req, res, next) => {
    try {
        const { uid, name, email } = await req.body;
        const user = await User.findOne({ uid });
        if (user) {
            return res.status(400).send({ message: "User already exists" });
        }
        const newUser = new User({
            uid,
            name,
            email,
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.log(error)
        next(error);
    }
};

const queryUser = async (req, res) => {
    try {
        const { username = "", id = "" } = req.query;
        const user = username !== "" ? await User.findOne({ username }) : await User.findOne({ _id: id });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const retUser = {
            id: user._id,
            uid: user.uid,
            name: user.name,
            username: user.username,
            profileImage: user.profileImage,
            email: user.email,
        };
        res.status(200).send(retUser);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
};

const getUid = async (id) => {
    try {
        // find user by id
        const user = await User.findOne({ _id: id });
        return user.uid;
    } catch (error) {
        console.log(error);
    }
};

const get_id = async (uid) => {
    try {
        // find user by id
        const user = await User.findOne({ uid: uid });
        return user._id;
    } catch (error) {
        console.log(error);
    }
};

const addFriends = async (req, res, next) => {
    try {
        const { uid, friendId } = req.body;
        console.log(req.body);
        const user = await User.findOne({ uid: uid });
        // console.log(user)
        if (!user) {
            console.log("fdsfas")
            return res.status(400).send({ message: "User not found" });
        }
        console.log("user hai")
        const ObjFrnd = mongoose.Types.ObjectId(friendId);
        const friendUid = await getUid(ObjFrnd);
        const friend = await User.findOne({ uid: friendUid });
        if (!friend) {
            return res.status(400).send({ message: "Friend not found" });
        }
        console.log("friends hai")
        const user_id = await get_id(uid);
        const friend_id = await get_id(friendUid);
        const userFriends = {
            friend: friend_id,
            sendBy: user_id,
        };
        user.friends.push(userFriends);
        const friendFriends = {
            friend: user_id,
            sendBy: user_id,
        };
        friend.friends.push(friendFriends);
        console.log("friends added", userFriends, friendFriends);
        await user.save();
        await friend.save();
        res.status(200).send({ message: "Friend added" });
    }
    catch (error) {
        next(error);
    }
}

const startChat = async (req, res, next) => {
    try {
        const { uid, friendId } = req.body;
        const currentUserData = await User.findOne({ uid: uid });
        if (!currentUserData) {
            return res.status(400).send({ message: "User not found" });
        }
        const ObjFrnd = mongoose.Types.ObjectId(friendId);
        const friendUid = await getUid(ObjFrnd);
        const secretId = nanoid(20);
        if (friendUid === uid) {
            const currUserChat = {
                users: {
                    id: currentUserData._id,
                    username: currentUserData.username,
                    profileImage: currentUserData.profileImage,
                },
                chatId: secretId,
            };
            currentUserData.chats.push(currUserChat);
            await currentUserData.save();
            res.status(200).send({ message: "Chat started", currentChats: currUserChat });
            return;
        }
        const friend = await User.findOne({ uid: friendUid });
        if (!friend) {
            return res.status(400).send({ message: "Friend not found" });
        }
        const user_id = await get_id(uid);

        //update chat document in both the users
        const friendUserData = await User.findOne({ uid: friendUid });
        const currUserChat = {
            users: {
                id: friend._id,
                username: friendUserData.username,
                profileImage: friendUserData.profileImage,
            },
            chatId: secretId,
        };
        currentUserData.chats.push(currUserChat);
        const friendChat = {
            users: {
                id: user_id,
                username: currentUserData.username,
                profileImage: currentUserData.profileImage,
            },
            chatId: secretId,
        };
        friend.chats.push(friendChat);
        const retUser = await currentUserData.save();
        const retFrnd = await friend.save();
        if (retUser.chats.chatId === retFrnd.chats.chatId) {
            console.log("chat id matched");
            const newChat = new Chat({
                chatId: secretId,
            });
            await newChat.save();
        }
        res.status(200).send({ message: "Chat started", currentChats: currUserChat });
    }
    catch (error) {
        next(error);
    }
}

const getChats = async (req, res, next) => {
    try {
        const { uid = "", id = "" } = req.query;
        if (uid === "" && id === "") {
            res.status(400).send({ message: "User not found" });
            return;
        }
        const userID = uid !== "" ? await User.findOne({ uid: uid }) : await User.findOne({ _id: id });
        if (!userID) {
            return res.status(400).send({ message: "User not found" });
        }
        const chats = userID.chats;
        res.status(200).send(chats);
    }
    catch (error) {
        next(error);
    }
};
const getUser = async (req, res, next) => {
    const { uid = "", id = "" } = req.query;
    if (uid === "" && id === "") {
        res.status(400).send({ message: "User not found" });
        return;
    }
    try {
        const userID = uid !== "" ? await User.findOne({ uid: uid }) : await User.findOne({ _id: id });
        if (!userID) {
            return res.status(400).send({ message: "User not found" });
        }
        const user = {
            id: userID._id,
            uid: userID.uid,
            username: userID.username,
            name: userID.name,
            email: userID.email,
            profileImage: userID.profileImage,
            chats: userID.chats,
            friends: userID.friends,
            servers: userID.servers
        };
        res.status(200).send(user);
    }
    catch (error) {
        console.log(error)
        next(error);
    }
};

const getUserServers = async (req, res, next) => {
    const { uid = "", id = "" } = req.query;

    if (uid === "" && id === "") {
        res.status(400).send({ message: "User not found" });
        return;
    }
    try {
        const userID = uid !== "" ? await User.findOne({ uid: uid }) : await User.findOne({ _id: id });
        if (!userID) {
            return res.status(400).send({ message: "User not found" });
        }
        const user = {
            servers: userID.servers,
        };
        res.status(200).send(user);
    }
    catch (error) {
        console.log(error)
        next(error);
    }
};

const changeUserName = async (req, res, next) => {
    const { uid, username } = req.body;
    try {
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        user.username = username;
        await user.save();
        res.status(200).send({ message: "Username changed" });
    }
    catch (error) {
        console.log(error)
        next(error);
    }
};

const getFriends = async (req, res, next) => {
    const { uid = "", id = "" } = req.query;
    if (uid === "" && id === "") {
        res.status(400).send({ message: "User not found" });
        return;
    }
    try {
        const userID = uid !== "" ? await User.findOne({ uid: uid }) : await User.findOne({ _id: id });
        if (!userID) {
            return res.status(400).send({ message: "User not found" });
        }
        // Check weather that the user has accept the request
        const friends = userID.friends.filter((friend) => friend.isAccept === true);
        if (friends.length === 0) {
            return res.status(200).send({ message: "No friends found" });
        }
        res.status(200).send(friends);
    }
    catch (error) {
        console.log(error)
        next(error);
    }
};

const getPendingFriends = async (req, res, next) => {
    const { uid = "", id = "" } = req.query;
    if (uid === "" && id === "") {
        res.status(400).send({ message: "User not found" });
        return;
    }
    try {
        const userID = uid !== "" ? await User.findOne({ uid: uid }) : await User.findOne({ _id: id });
        if (!userID) {
            return res.status(400).send({ message: "User not found" });
        }
        // Check weather that the user has accept the request
        const friends = userID.friends.filter((friend) => friend.isAccept === false);
        if (friends.length === 0) {
            return res.status(200).send({ message: "No Pending Requests found" });
        }
        res.status(200).send(friends);
    }
    catch (error) {
        console.log(error)
        next(error);
    }
};

const createServers = async (req, res, next) => {
    const { uid, serverId, serverName, serverImage } = req.body;
    try {
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const server = await User.findOne({ servers: { serverId: serverId } });
        if (server) {
            return res.status(400).send({ message: "You Already have a server" });
        }
        // add server id to User model
        const serverData = {
            serverId: serverId,
            serverName: serverName,
            serverImage: serverImage,
        };
        user.servers.push(serverData);
        await user.save();
        res.status(200).send({ message: "Server created" });
    } catch (error) {
        console.log(error)
        next(error);
    }
}

const joinServers = async (req, res, next) => {
    const { uid, serverId, serverName, serverImage } = req.body;
    try {
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const server = await User.findOne({ servers: { serverId: serverId } });
        if (server) {
            return res.status(400).send({ message: "You Already have a server" });
        }
        // add server id to User model
        const serverData = {
            serverId: serverId,
            serverName: serverName,
            serverImage: serverImage,
        };
        user.servers.push(serverData);
        await user.save();
        res.status(200).send({ message: "Server joined", id: user._id });
    } catch (error) {
        console.log(error);
        next(error);
    }
};



module.exports = { addUser, addFriends, joinServers, getFriends, getPendingFriends, queryUser, startChat, getChats, getUser, getUserServers, changeUserName, createServers, get_id };
