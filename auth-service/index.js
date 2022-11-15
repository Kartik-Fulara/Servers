
const mongoose = require('mongoose');
const express = require("express")
const morgan = require('morgan');
const createError = require("http-errors");
const cors = require('cors');

// require dotenv config

require("dotenv").config();

const authRouter = require("./routes/Auth.route.js");

const chatRouter = require("./routes/Chat.route.js");

const serverRouter = require("./routes/Server.Router.js");

const { verifyUser } = require("./middleware/verifyUser.js");

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

    app.use(express.json());

    app.use(express.urlencoded({ extended: true }));

    app.use(cors());

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Credentials", true);
        next();
    })

    app.get("/", (req, res) => {
        res.send("WELCOME TO CODERS PARK");
    });

    app.use("/auth", authRouter);

    app.use("/chat", verifyUser, chatRouter);

    app.use("/server", verifyUser, serverRouter);
    // HTTP ERRORS

    app.get("/verifyToken", verifyUser, (req, res) => {
        res.status(200).send({ message: "Token Verified" });
    });


    app.use((req, res, next) => {
        next(createError(404));
    });

    app.use((err, req, res, next) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        res.status(err.status || 500);
        res.json({
            error: {
                message: err.message
            }
        });
    });

    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running on port ${process.env.PORT || 4000}`);
    });



}
)();
