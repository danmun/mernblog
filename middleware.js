const jwt = require('jsonwebtoken');
const User = require('./models/UserSchema');
const STRINGS = require('./locale/en').STRINGS;
// NOTE: secret is different between production and development runs;
//  users created in production will fail auth in development
const secret = process.env.SECRET || "not_so_secret";

const logout = (req, res) => {
    if(res.statusCode === 401){
        res.status(401).send(STRINGS.LOGOUT_FAILURE);
    }else{
        res.clearCookie("token", { httpOnly: true }).status(200).send("Successfully logged out!");
    }
}

//TODO: change res.statusCode === 200 to req.loggedin
const login = (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }, function(err, user) {
        const _id = user._id;
        if (err) {
            console.error(err);
            res.status(500).json({error: STRINGS.SERVER_ERROR});
        } else if (!user) {
            res.status(401).json({error: STRINGS.LOGIN_FAILURE});
        } else {
            user.isCorrectPassword(password, function(err, same) {
                if (err) {
                    res.status(500).json({error: STRINGS.SERVER_ERROR});
                } else if (!same) {
                    res.status(401).json({error: STRINGS.LOGIN_FAILURE});
                } else {
                    // Issue token
                    const payload = { username, _id };
                    const token = jwt.sign(payload, secret, {expiresIn: '1h'});
                    res.cookie('token', token, { httpOnly: true }).sendStatus(200);
                }
            });
        }
    });
}

// mechanisms could be renamed to withUser + withAuth instead of checkAuth + enforceAuth

// calls back with user obj if user is logged in
const checkAuth = (req, res, next) => {
    verifyToken(parseToken(req), function(username){
        req.username = username ? username : null;
        next();
    })
}

// DONE: for some reason, cookie is not valid after page reload --
//  REASON: variable secret was redefined as something else in this file

// enforces authentication on the incoming request
// will halt the request chain and respond to the client with 401 if unauthenticated
const enforceAuth = (req, res, next) => {
    verifyToken(parseToken(req), function(user){
        if(user){
            req.user = user;
            next();
        }else{
            res.status(401).send();
        }
    })
}

// verifies the given token and calls back with the user encoded in the token
const verifyToken = (token, callback) => {
    if(!token){
        callback(null);
        return;
    }
    jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            // invalid token
            callback(null);
        } else {
            const {_id, username} = decoded;
            const user = {_id, username};
            callback(user);
        }
    });
}


const parseToken = (request) => {
    return request.body.token ||
        request.query.token ||
        request.headers['x-access-token'] ||
        request.cookies.token;
}

module.exports = {
    enforceAuth: enforceAuth,
    checkAuth: checkAuth,
    logout: logout,
    login: login
}