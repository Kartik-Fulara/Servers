const User = require("../models/User.model.js");
const { generateToken, getPayload } = require("../helpers/jwt_helper.js");
const bcrypt = require("bcrypt");
const { addUser } = require("./Chat.Controller.js");


// handle Error
const handleError = (err) => {
    console.log(err.message, err.code);
    let errors = { name: '', email: '', password: '' };

    // not enter name
    if (err.message === "Please Enter Your Name") {
        errors.name = "Please Enter Your Name";
    }


    // not enter both email and password
    if (err.message === "Please Enter Your Email and Password") {
        errors.email = "Please Enter Your Email";
        errors.password = "Please Enter Your Password";
    }


    // incorrect email
    if (err.message === 'incorrect email' || err.message === 'Incorrect Email') {
        errors.email = 'Email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password' || err.message === 'Incorrect Password') {
        errors.password = 'Password is incorrect';
    }

    // duplicate error code
    if (err.code === 11000 || err.code === 11001) {
        errors.email = 'Email is already registered';
        return errors;
    }

    // validation errors
    if (err.message?.includes('user validation failed') || err.message?.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

const register = async (req, res, next) => {

    const { firstName, lastName, email, password } = req.body;

    const name = firstName + " " + lastName;

    try {

        if (!firstName || !lastName || firstName === "" || lastName === "") {
            throw new Error("Please Enter Your Name");
        }

        await User.create({ name, email, password });

        // add details to other server

        const user = await User.findOne({ email });
        if (user) {
        const response = await addUser(user.uid, user.name, user.email);
            res.status(201).json({ message: "ACCOUNT CREATED SUCCESSFULLY", data: response });
        }
        return;

    } catch (err) {
        const error = handleError(err);
        console.log(error);
        res.status(406).send(error);
        return;
    }
}

const login = async (req, res, next) => {

    const { email, password } = req.body;

    console.log(email, password);

    if (!email || !password || email === "" || password === "") {
        res.status(500).send(handleError("Please Enter Your Email and Password"));
        return;
    }

    try {

        const user = await User.findOne({ email });
        console.log(user);
        if (user) {
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                const token = generateToken(user.uid);

                // save token to database

                const userToken = res.cookie.token;

                console.log(userToken);

                user.tokens = user.tokens.concat(token);
                await user.save();

                res.status(200).json({ token: token });
                return;
            }
            throw Error('incorrect password');

        } else {
            throw Error('incorrect email');
        }

    } catch (err) {
        const error = handleError(err);
        console.log(error);
        res.status(406).send(error);
    }
}

const logout = async (req, res, next) => {

    const token = `token ${req.body.token}`;

    // remove the token from the database

    try {
        const payload = getPayload(token);
        const user = await User.findOne({ uid: payload });
        if (user) {

            // check weather the token is present in the database
            const isAvailable = user.tokens.includes(token.split(" ")[1]);

            if (!isAvailable) {
                res.status(500).send(handleError("You are not logged in"));
                return;
            }

            // delete the token from the database
            const index = user.tokens.indexOf(token.split(" ")[1]);

            if (index > -1) {
                user.tokens.splice(index, 1);
                await user.save();
                res.status(200).json({ message: "LOGGED OUT SUCCESSFULLY" });
                return;
            }

            res.status(200).json({ message: "LOGGED OUT SUCCESSFULLY" });
            return;

        } else {
            res.status(500).send(handleError("User Not Found"));
            return;
        }

    } catch (err) {
        res.status(500).send(handleError(err));
    }

}


module.exports = { register, login, logout };

