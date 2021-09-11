// NOTE: Consider creating separate user and auth controllers once more extensive operations are implemented on the User
// (e.g. sign up, update profile, etc...)
const jwt = require('jsonwebtoken');
const User = require('../../models/UserSchema');
const STRINGS = require('../../locale/en').STRINGS;
const DEFAULT_SECRET = "not_so_secret"
const secret = process.env.SECRET || DEFAULT_SECRET;
if(secret === DEFAULT_SECRET){
    console.error("!!!!!!!!!!!!!   Production server SECRET is not set in env   !!!!!!!!!!!!! - controllers/user.js")
}

const logout = (req, res) => {
    if(res.statusCode === 401){
        res.status(401).send(STRINGS.LOGOUT_FAILURE);
    }else{
        // TODO:CLEANUP don't just clear the cookie, invalidate the token to prevent replay attack
        res.clearCookie("token", { httpOnly: true }).status(200).send("Successfully logged out!");
    }
}

//TODO: change res.statusCode === 200 to req.loggedin
const login = (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }, function(err, user) {
        if (err) {
            res.status(500).json({error: STRINGS.SERVER_ERROR});
        } else if (!user) {
            res.status(401).json({error: STRINGS.LOGIN_FAILURE});
        } else {
            user.isCorrectPassword(password, function(err, same) {
                const _id = user._id;
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

const isAdmin = (req, res) => {
    res.send({
        "isAdmin": !!req.user
    })
}

module.exports = {
    logout: logout,
    login: login,
    isAdmin: isAdmin
}