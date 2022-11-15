require("dotenv").config();
const morgan = require('morgan');
const createError = require("http-errors");
const UserRouter = require("./routes/Users.routes.js");
const ChatRouter = require("./routes/Chats.routes.js");
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');

(async () => {

    mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME,
    }).then(() => {
        console.log('Connected to MongoDB');
    }
    ).catch((err) => {
        console.log(err);
    }
    );


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

    app.use(cors());

    app.use(express.urlencoded({ extended: true }));

    app.use(express.json());

    app.disable('etag');

    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });



    app.get("/", (req, res) => {
        console.log(`Welcome to chat service ${req.protocol + '://' + req.get('host') + req.originalUrl}`);
        res.send(`Welcome to Coders Park  ${req.protocol + '://' + req.get('host') + req.originalUrl}`);

    });

    // all /api/UserRoutes
    app.use('/api', UserRouter);

    // all /api/ChatRoutes
    app.use('/api', ChatRouter);

    app.use(async (req, res, next) => {
        next(createError.NotFound());
    });

    app.use(async (error, req, res, next) => {
        res.status(error.status || 500);
        res.send({
            error: {
                status: error.status || 500,
                message: error.message
            }
        });
    });

    app.listen(process.env.PORT || 1000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });

}
)();




