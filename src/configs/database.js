const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = new MongoMemoryServer().getConnectionString().then((mongoUri) => {
    mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function(err) {
        if (err){
            console.log("[MongoDB] Connect error", err);
            throw err;
        }
    });

    mongoose.connection.once('open', () => {
        console.log(`[MongoDB] successfully connected to ${mongoUri}`);
    });
});
