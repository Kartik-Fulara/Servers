const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
    return jwt.sign({ payload }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
}


// get payload from token

const getPayload = (token) => {

    const userToken = token.split(" ")[1];

    const verified = jwt.verify(userToken, process.env.JWT_SECRET);

    return verified.payload;
}


module.exports = { generateToken, getPayload };
