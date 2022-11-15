// verify the user based on the token

const User = require("../models/User.model.js");
const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).send("Access Denied");
        return;
    }

    try {

        const userToken = token.split(" ")[1];

        const verified = jwt.verify(userToken, process.env.JWT_SECRET);

        const user = await User.findOne({ uid: verified.payload });

        if (!user) {
            res.status(401).send("Access Denied");
            return;
        }

        const isMatch = user.tokens.includes(userToken);

        if (!isMatch) {
            res.status(401).send({message:"Access Denied"});
            return;
        }

        req.user = verified.payload;

        next();

    } catch (err) {

        res.status(400).send("Invalid Token");

    }

}

module.exports = { verifyUser };
