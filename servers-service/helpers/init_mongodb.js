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


