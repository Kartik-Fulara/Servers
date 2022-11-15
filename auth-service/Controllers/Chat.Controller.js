const axios = require("axios");
const addUser = async (uid, name, email) => {
    try {
        const response = await axios.post(`${process.env.CHAT_SERVER_URL}/api/addUser`, {
            uid,
            name,
            email
        });
        
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

module.exports =  { addUser };
