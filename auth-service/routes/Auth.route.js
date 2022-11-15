const express = require('express');

const { register, login, logout } = require('../Controllers/AuthController.js');

const router = express.Router();

// register route
router.post('/register', register);

// login route
router.post('/login', login);

//logout route
router.delete('/logout', logout);

//delete user data
// router.delete('/delete', deleteUser);

// router.post("/forgot-password", forgotPassword);

// reset password
// router.post("/reset-password", resetPassword);

module.exports = router;

