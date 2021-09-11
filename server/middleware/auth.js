const jwt = require('jsonwebtoken');
const DEFAULT_SECRET = "not_so_secret"
const secret = process.env.SECRET || DEFAULT_SECRET;
if(secret === DEFAULT_SECRET){
    console.error("!!!!!!!!!!!!!  Production server SECRET is not set in env   !!!!!!!!!!!!! - middleware/auth.js")
}

/**
 * Check if the user is logged in.
 * @param req Express request
 * @param res Express response
 * @param next request chain progressor
 */
const check = (req, res, next) => {
    verifyToken(parseToken(req), (user) => {
        req.user = user;
        next();
    })
}

/**
 * Enforce authentication on the current request.
 * User must be logged in to complete this request.
 * NOTE: middleware/controller chain will halt with a 401 if user is not logged in.
 * @param req
 * @param res
 * @param next
 */
const enforce = (req, res, next) => {
    verifyToken(parseToken(req), (user) => {
        if(user){
            req.user = user;
            next();
        }else{
            res.status(401).send();
        }
    })
}

/**
 * Verifies the given token.
 * Calls back with the user described in the token, or with null if the token is invalid.
 * @param token the auth token present in the request, if any
 * @param callback function to execute upon validating the token, expects user or null as argument
 */
const verifyToken = (token, callback) => {
    if(token){
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                callback(null);
            } else {
                const {_id, username} = decoded;
                const user = {_id, username};
                callback(user);
            }
        });
    }else{
        callback(null);
    }
}

const parseToken = (request) => {
    return request.body.token ||
        request.query.token ||
        request.headers['x-access-token'] ||
        request.cookies.token;
}

module.exports = {
    enforce: enforce,
    check: check
}