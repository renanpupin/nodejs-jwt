const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const { asyncMiddleware } = require("../middlewares/async.js");
const User = require("../models/user");
const TokenBlacklist = require("../models/tokenBlacklist");
const authorizerMiddleware = require("../middlewares/authorizer");

router.get('/', asyncMiddleware(async (req, res) => {
    res.json({success: true, message: "NODEJS-JWT API."});
}));

router.post('/signup', asyncMiddleware(async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    await new User({
        email,
        password,
    }).save();

    return res.json({
        success: true,
        message: "Success."
    });
}));

router.post('/signin', asyncMiddleware(async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let user = await User.findOne({email}, 'email password');

    if(!user.checkPassword(password)){  //check password
        return res.status(401).json({
            success: false,
            message: "Unauthorized."
        });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
        // expiresIn: 300 // expires in 5min
        expiresIn: 3 // expires in 3s
    });

    const refreshToken = jwt.sign({ id: user._id, isRefreshToken: true }, process.env.SECRET, {
        // expiresIn: 86400 // expires in 24hours
        expiresIn: 5 // expires in 5s
    });

    user.reauth = false;

    return res.json({
        success: true,
        message: "Success.",
        jwt: token,
        refreshToken
    });
}));

router.get('/protected', authorizerMiddleware, asyncMiddleware(async (req, res) => {
    return res.json({
        success: true,
        message: "Success."
    });
}));

router.post('/regenerate', authorizerMiddleware, asyncMiddleware(async (req, res) => {
    const refreshToken = req.body.refreshToken;

    const token = jwt.sign({ id: req.user._id }, process.env.SECRET, {
        // expiresIn: 300 // expires in 5min
        expiresIn: 3 // expires in 3s
    });

    return res.json({
        success: true,
        message: "Success.",
        token
    });
}));

router.post('/revoke', authorizerMiddleware, asyncMiddleware(async (req, res) => {
    const token = req.body.token;

    // const tokenBlacklist = await new TokenBlacklist({
    //     token,
    //     user: req.user._id
    // }).save();

    let user = await User.findOne({_id: req.user._id});
    user.reauth = true;
    await user.save();

    return res.json({
        success: true,
        message: "Success."
    });
}));

module.exports = router;
