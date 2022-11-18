const express = require("express");
const User = require("../models/user.model.js");
const mongoose = require('mongoose');
const { Chat } = require("../models/chat.model.js");
const { nanoid } = require("nanoid");
const { changeUserNameToChats, getUid, get_id } = require("../util/Chat.utility.js");

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

const acceptFriendRequest = async (req, res, next) => {
    try {
        const { uid, friendId } = req.body;
        console.log("friendsId", friendId);
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const ObjFrnd = mongoose.Types.ObjectId(friendId);
        console.log("friend", ObjFrnd);
        const friendUid = await getUid(ObjFrnd);
        console.log("friendUid", friendUid);
        const user_id = await get_id(uid);
        console.log("id", user_id)
        const friend = await User.findOne({ uid: friendUid });
        if (!friend) {
            return res.status(400).send({ message: "Friend not found" });
        }
        const friends = user.friends.filter((friend) => friend.friend.toString() !== friendId.toString());
        user.friends = friends;
        const friendsFriends = friend.friends.filter((friend) => friend.friend.toString() !== user_id.toString());
        friend.friends = friendsFriends;
        // change is Accept to true and remove the previous request

        const friend_id = await get_id(friendUid);
        const userFriends = {
            friend: friend_id,
            sendBy: user_id,
            isReq: true,
            isAccept: true,
            isDecline: false,
            username: friend.username,
            profileImage: friend.profileImage,
        };
        user.friends.push(userFriends);
        const friendFriends = {
            friend: user_id,
            sendBy: user_id,
            isReq: false,
            isAccept: true,
            isDecline: false,
            username: user.username,
            profileImage: user.profileImage,
        };
        friend.friends.push(friendFriends);
        console.log("friends added", userFriends, friendFriends);
        await user.save();
        await friend.save();
        res.status(200).send({ message: "Friend added", myData: userFriends, friendData: friendFriends });
    }
    catch (error) {
        next(error);
    }
}

const declineFriendsRequest = async (req, res, next) => {
    try {
        const { uid, friendId } = req.body;
        console.log(uid, friendId);
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const ObjFrnd = mongoose.Types.ObjectId(friendId);
        const friendUid = await getUid(ObjFrnd);
        const user_id = await get_id(uid);
        console.log("friendUid", friendUid);
        const friend = await User.findOne({ uid: friendUid });
        if (!friend) {
            return res.status(400).send({ message: "Friend not found" });
        }
        const friends = user.friends.filter((friend) => friend.friend.toString() !== friendId.toString());
        user.friends = friends;
        const friendsFriends = friend.friends.filter((friend) => friend.friend.toString() !== user_id.toString());
        friend.friends = friendsFriends;
        // change is Accept to true and remove the previous request

        const userFriends = {
            friend: friendId,
            sendBy: user_id,
            isReq: false,
            isAccept: false,
            isDecline: true,
            username: friend.username,
            profileImage: friend.profileImage,
        };

        const friendFriends = {
            friend: user_id,
            sendBy: user_id,
            isReq: true,
            isDecline: true,
            isAccept: false,
            username: user.username,
            profileImage: user.profileImage,
        };
        friend.friends.push(friendFriends);
        console.log("friends added", userFriends, friendFriends);
        await user.save();
        await friend.save();
        res.status(200).send({ message: "Friend Request Cancel", myData: userFriends, friendData: friendFriends });

    }
    catch (error) {
        res.status(500).send(error.message);
        return;
    }
}

const addFriend = async (req, res, next) => {
    try {
        const { uid, friendId } = req.body;
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const ObjFrnd = mongoose.Types.ObjectId(friendId);
        const friendUid = await getUid(ObjFrnd);
        const friend = await User.findOne({ uid: friendUid });
        if (!friend) {
            return res.status(400).send({ message: "Friend not found" });
        }
        const user_id = await get_id(uid);
        const friend_id = await get_id(friendUid);
        const userFriends = {
            friend: friend_id,
            sendBy: user_id,
            isReq: true,
            isAccept: false,
            isDecline: false,
            username: friend.username,
            profileImage: friend.profileImage,
        };
        user.friends.push(userFriends);
        const friendFriends = {
            friend: user_id,
            sendBy: user_id,
            isReq: false,
            isAccept: false,
            isDecline: false,
            username: user.username,
            profileImage: user.profileImage,
        };
        friend.friends.push(friendFriends);
        console.log("friends added", userFriends, friendFriends);
        await user.save();
        await friend.save();
        res.status(200).send({ message: "Friend added", myData: userFriends, friendData: friendFriends });
    }
    catch (error) {
        next(error);
    }
};

const removeRequest = async (req, res, next) => {
    const { uid, friendId } = req.body;
    try {
        console.log("uid", uid, "friend", friendId);
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const ObjFrnd = mongoose.Types.ObjectId(friendId);
        const user_id = await get_id(uid);
        console.log(user_id);
        const friendUid = await getUid(ObjFrnd);
        console.log("friendUid", friendUid);
        const friend = await User.findOne({ uid: friendUid });
        if (!friend) {
            return res.status(400).send({ message: "Friend not found" });
        }
        const friends = user.friends.filter((friend) => friend.friend.toString() !== friendId.toString());
        user.friends = friends;
        const friendsFriends = friend.friends.filter((friend) => friend.friend.toString() !== user_id.toString());
        friend.friends = friendsFriends;

        const userFriends = {
            friend: friendId,
            sendBy: user_id,
            isReq: true,
            isAccept: false,
            isDecline: true,
            username: friend.username,
            profileImage: friend.profileImage,
        };
        const friendFriends = {
            friend: user_id,
            sendBy: user_id,
            isReq: false,
            isAccept: false,
            isDecline: true,
            username: user.username,
            profileImage: user.profileImage,
        };

        user.friends.push(userFriends);
        await user.save();
        await friend.save();
        res.status(200).send({ message: "Friend Request Cancel", myData: userFriends, friendData: friendFriends });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const removeFriends = async (req, res, next) => {
    const { uid, friendId } = req.body;
    try {
        console.log("uid", uid, "friend", friendId);
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const ObjFrnd = mongoose.Types.ObjectId(friendId);
        const user_id = await get_id(uid);
        console.log(user_id)
        const friendUid = await getUid(ObjFrnd);
        console.log("friendUid", friendUid);
        const friend = await User.findOne({ uid: friendUid });
        if (!friend) {
            return res.status(400).send({ message: "Friend not found" });
        }
        const friends = user.friends.filter((friend) => friend.friend.toString() !== friendId.toString());
        user.friends = friends;
        const friendsFriends = friend.friends.filter((friend) => friend.friend.toString() !== user_id.toString());
        friend.friends = friendsFriends;

        const userFriends = {
            friend: friendId,
            username: friend.username,
        };
        const friendFriends = {
            friend: user_id,
            username: user.username,
        };


        await user.save();
        await friend.save();
        res.status(200).send({ message: "Friend removed", myData: userFriends, friendData: friendFriends });
    } catch (error) {
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

const getUserChat = async (req, res, next) => {
    const { uid } = req.query;
    try {
        console.log(uid);
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        const chats = user.chats;
        console.log(chats);
        res.status(200).send({ message: "User chats", chats: chats });
    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
};

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
        user.chats.forEach(async (chat) => {
            const chatId = chat.chatId;
            const senderId = chat.users.id;
            const response = await changeUserNameToChats(senderId, chatId, username);
            if (response.status === "error") {
                res.status(400).send({ message: "Error in changing username" });
                return;
            }
            console.log(response);
        });
        user.username = username;
        await user.save();
        res.status(200).send({ message: "Username changed", username: username });
    }
    catch (error) {
        console.log(error);
        res.status(401).send({ message: "Username already taken" });
        return;
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

const leaveServers = async (req, res, next) => {
    const { userId, serverId } = req.body;
    try {
        console.log(userId, serverId);
        const user = await User.findOne({ _id: userId });
        console.log(user);
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        // remove server id from User model
        user.servers = user.servers.filter((server) => server.serverId !== serverId);
        await user.save();
        res.status(200).send({ message: "Server left" });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Error in leaving server" });
    }
};

const updateUser = async (req, res, next) => {
    const { uid, name, email, username } = req.body;
    try {
        console.log(uid, name, email, username);
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        user.name = name;
        user.email = email;
        if (username !== "") {
            // call change username function
            user.chats.forEach(async (chat) => {
                const chatId = chat.chatId;
                const senderId = chat.users.id;
                const response = await changeUserNameToChats(senderId, chatId, username);
                if (response.status === "error") {
                    res.status(400).send({ message: "Error in changing username" });
                    return;
                }
                console.log(response);
            });
            user.username = username;
        }
        const updatedData = await user.save();
        res.status(200).send({ message: "User updated", data: updatedData });
        return;
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error });
        return;
    }
};

const router = express.Router();

// get user id
router.get("/getId", async (req, res, next) => {
    try {
        const { uid } = req.query;
        const id = await get_id(uid);
        res.status(200).send(id);
    } catch (error) {
        console.log(error)
        next(error);
    }
});

// add user to the database
router.post("/addUser", addUser);

// search a user through username using get method and query
router.get("/searchUser", queryUser);

// start the chat
router.post("/startChat", startChat);

// get all chats
router.get("/getChats", getChats);

// get logged in user
router.get("/getUserInfo", getUser);

// get User Chats
router.get("/getUserChat", getUserChat);

// send friend request
router.post("/add-friends", addFriend);

// remove friends 
router.delete("/removeFriend", removeFriends);

// cancel friends request
router.delete("/deleteReq", removeRequest);

// accept request
router.put("/acceptFriend", acceptFriendRequest);

// reject friend request
router.put("/rejectFriend", declineFriendsRequest);

// get Accepted Friends
router.get("/getAllFriends", getFriends);

// get Pending Friends
router.get("/getPendingFriends", getPendingFriends)

// create a new server for the user
router.post("/createServer", createServers);

// join a new server for the user
router.post("/joinServer", joinServers);

// getting all servers that users have already joined
router.get("/getallServers", getUserServers);

// change username
router.post("/changeUserName", changeUserName);

// remove user from the server
router.post("/leaveServer", leaveServers);

// change user profile
router.post("/updateUser", updateUser);



module.exports = router;
