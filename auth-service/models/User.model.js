const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var { nanoid } = require("nanoid");

const validator = require("validator");

const { isEmail } = validator;

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        lowercase: true,
        unique: true,
        validate: [isEmail, "Please Enter a Valid Email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minlength: [4, "Minimum Password Length is 4 Characters"],
    },
    uid: {
        type: String,
        default: () => nanoid(20),
        unique: true,
    },
    tokens: [{
        type: String,
        expires: 60 * 60 * 24 * 365,
    }]
});



// hash Password before saving into the database
UserSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(user.password, salt);
    }
    next();
});


const User = mongoose.model("User", UserSchema);

module.exports = User;
