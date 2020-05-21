const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const mongoose = require('mongoose');
const app = express();

//start database
const mongoServer = require('./configs/database')

//logic modifiers (body parser and cors)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, PUT, DELETE');
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    next();
});

//routes
app.get('/', function(req, res){
    res.json("NODEJS-JWT API.");
});
app.use('/api', require("./routes/v1"));

module.exports = app;
