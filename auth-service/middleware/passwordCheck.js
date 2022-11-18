const bcrypt = require("bcrypt");
// create a middle ware that use bcrypt to check the password
const checkPassword = async (pass, hashPass) => {
    console.log(pass, hashPass);
    const auth =  bcrypt.compareSync(pass, hashPass);
    return auth;
}

module.exports = checkPassword;
