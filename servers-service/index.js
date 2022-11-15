require("dotenv").config();
const qs = require('qs');
const axios = require("axios");
const express = require('express');
const morgan = require('morgan');
const createError = require("http-errors");
const cors = require("cors");
const ServersRouter = require("./routes/Servers.Routes.js");
const mongoose = require('mongoose');




mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});

// Connecting to MongoDB

mongoose.connection.on('connected', () => {
    console.log(`Connecting to MongoDB ${process.env.DB_NAME} database`);
});

mongoose.connection.on('error', (err) => {
    console.log(err);
});


mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});


// Disconnecting from MongoDB

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
}
);






const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome to Coders Park Channel");
});

app.use("/call", ServersRouter);


app.listen(process.env.PORT || 8080, () => {
    console.log("Listening on port 8080");
});
