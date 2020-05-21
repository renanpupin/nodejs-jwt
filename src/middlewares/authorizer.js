const jwt = require('jsonwebtoken');
const User = require('../models/user');
const TokenBlacklist = require('../models/tokenBlacklist');

module.exports = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    if(!authorizationHeader){
        return res
            .status(401)
            .send({
                success: false,
                message: 'No authorization header provided.',
                reauth: false
            });
    }

    const token = authorizationHeader.replace("JWT ","");
    if (!token){
        return res
            .status(401)
            .send({
                success: false,
                message: 'No token provided.',
                reauth: false
            });
    }

    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        if (err){
            console.log(err);

            return res
                .status(401)
                .send({
                    success: false,
                    message: 'Failed to authenticate token. ('+err.message+')',
                    reauth: (decoded && decoded.isRefreshToken && err.name === "TokenExpiredError") || false
                });
        }

        let user = await User.findOne({_id: decoded.id}, 'email reauth');

        // let tokenBlacklist = await TokenBlacklist.findOne({token});
        // console.log("tokenBlacklist", tokenBlacklist);
        if(user.reauth){
                return res
                    .status(401)
                    .send({
                        success: false,
                        message: 'Token revoked, please signin again.',
                        reauth: true
                    });
        }

        if(decoded && decoded.isRefreshToken && req.url !== '/regenerate'){
            return res
                .status(401)
                .send({
                    success: false,
                    message: 'Forbidden to fetch info with refresh token.',
                    reauth: false
                });
        }

        req.user = user

        return next();
    });
}
