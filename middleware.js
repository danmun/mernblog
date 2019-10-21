const jwt = require('jsonwebtoken');
const User = require('./models/UserSchema');
const STRINGS = require('./locale/en').STRINGS
// NOTE: secret is different between production and development runs;
//  users created in production will fail auth in development
const secret = process.env.SECRET || "not_so_secret"

const logout = function(req, res) {
    if(res.statusCode === 401){
        res.status(401).send(STRINGS.LOGOUT_FAILURE);
    }else{
        res.clearCookie("token", { httpOnly: true }).status(200).send("Successfully logged out!");
    }
}

//TODO: change res.statusCode === 200 to req.loggedin
const login = function(req, res) {
    const { username, password } = req.body;
    User.findOne({ username }, function(err, user) {
        if (err) {
            console.error(err);
            res.status(500)
                .json({
                    error: STRINGS.SERVER_ERROR
                });
        } else if (!user) {
            res.status(401)
                .json({
                    error: STRINGS.LOGIN_FAILURE
                });
        } else {
            user.isCorrectPassword(password, function(err, same) {
                if (err) {
                    res.status(500)
                        .json({
                            error: STRINGS.SERVER_ERROR
                        });
                } else if (!same) {
                    res.status(401)
                        .json({
                            error: STRINGS.LOGIN_FAILURE
                        });
                } else {
                    // Issue token
                    const payload = { username };
                    const token = jwt.sign(payload, secret, {
                        expiresIn: '1h'
                    });
                    res.cookie('token', token, { httpOnly: true }).sendStatus(200);
                }
            });
        }
    });
}

const checkIsAdmin = function(req, res) {
    let isAdmin = false
    if(res.statusCode === 200){
        isAdmin = true
    }
    res.status(200).send({
        "isAdmin": isAdmin,
    })
}

// DONE: for some reason, cookie is not valid after page reload --
//  REASON: variable secret was redefined as something else in this file
const withAuth = function(req, res, next) {
    const token =
        req.body.token ||
        req.query.token ||
        req.headers['x-access-token'] ||
        req.cookies.token

    if (!token) {
        // missing token
        res.status(401);
        next();
    } else {
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                // invalid token
                res.status(401)
                next();
            } else {
                res.status(200)
                req.username = decoded.username;
                next();
            }
        });
    }
}

module.exports = {
    withAuth: withAuth,
    logout: logout,
    login: login,
    checkIsAdmin: checkIsAdmin
}