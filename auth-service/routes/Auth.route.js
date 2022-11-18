const express = require('express');

const { register, login, logout, changePassword, updateDetails, leaveServer } = require('../Controllers/AuthController.js');

const router = express.Router();

// register route
router.post('/register', register);

// login route
router.post('/login', login);

//logout route
router.delete('/logout', logout);

// change password route
router.post('/changePass', changePassword);

// change user details
router.post('/updateDetails', updateDetails);

router.post("/leaveServer", leaveServer);
//delete user data
// router.delete('/delete', deleteUser);

module.exports = router;

