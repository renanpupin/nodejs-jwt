require('dotenv').config()
const ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;

let app = require("./src/app.js")
let server = require('http').createServer(app);

//start server
server.listen(PORT, function() {
    console.log("["+ENV+" - "+PORT+"] NODEJS-JWT API running...");
});

module.exports = server;
