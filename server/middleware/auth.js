const jwt = require('jsonwebtoken');
const User = require('../../models/UserSchema');
const MFAEnrolment = require('../../models/MFAEnrolment');
const twoFactor = require("node-2fa");
const STRINGS = require('../../locale/en').STRINGS;
const DEFAULT_SECRET = "not_so_secret"
// TODO:CLEANUP read secret from file/config file/defaults file etc
const SECRET = (process.env.SECRET || DEFAULT_SECRET).trim();
if(SECRET === DEFAULT_SECRET){
    console.error("!!!!!!!!!!!!!  Production server SECRET is not set in env   !!!!!!!!!!!!! - middleware/auth.js")
}

/**
 * Process a 2FA login attempt or challenge the user with 2FA if needed.
 * If a 2FA code is present in the request to /login, we process a 2FA attempt.
 * Otherwise we check whether the user must be asked for 2FA.
 *
 * Flow:
 * 1. user posts username, password
 * 2. if username has enrolment, set mfa-start true
 * 3. user submits code, frontend includes password again
 * 4. verify both factors now, reject or accept the entire auth process here
 * @param req
 * @param res
 * @param next
 * @returns {NodeJS.Global.Promise<void>}
 */
const process2fa = async (req, res, next) => {
    const { username, password } = req.body;
    const user = await User.findOne({username});
    // we place the user in context for convenience and to avoid hitting the DB again in the request chain
    // differentiate between the custom user object in the jwt and this user object by calling it something else
    req.userFromMongo = user;
    if(user && password){
        if(req.body.code){
            verify2fa(req, res, next);
        }else{
            // note that during the first step (uname/pwd login),
            // frontend sends entire form, i.e. there will be an empty code present, which will
            // trigger challenge2fa, not verify2fa. Consider refactoring so that empty string code
            // directs to verify2fa, while an entirely non-existing code in payload directs to
            // challenge2fa (update frontend to remove code obj from form on uname+pw step)
            challenge2fa(req, res, next);
        }
    }else{
        // let next function in the chain handle the empty user
        next();
    }
}

/**
 * Check if the user has 2FA enabled. Challenge them if they do.
 * @param req
 * @param res
 * @param next
 * @returns {NodeJS.Global.Promise<void>}
 */
const challenge2fa = async (req, res, next) => {
    const user = req.userFromMongo;
    let enrolment;
    try{
        enrolment = await MFAEnrolment.findOne({user: user._id});
    }catch(err){
        // if we get an error here, we MUST halt the request chain,
        // otherwise user gets passed to next middleware/controller below and can possibly log in without 2FA
        console.error(err);
        res.status(500).send({message: STRINGS.SERVER_ERROR})
        return;
    }

    if(enrolment){
        // start 2fa flow
        res.status(200).send({mfa: true})
    }else{
        // we proceed to normal login (via the next function in the request chain)
        next()
    }
}

/**
 * Verify the 2FA code if a 2FA flow is in progress.
 * @param req
 * @param res
 * @param next
 * @returns {NodeJS.Global.Promise<void>}
 */
const verify2fa = async (req, res, next) => {
    const {code} = req.body;
    const user = req.userFromMongo;
    let enrolment;

    try{
        enrolment = await MFAEnrolment.findOne({user: user._id});
    }catch(err){
        console.error(err);
        res.status(500).send({message: STRINGS.SERVER_ERROR})
        return;
    }

    if(enrolment){
        const match = twoFactor.verifyToken(enrolment.secret, code, 1);
        if(match && match.delta === 0){
            // proceed to next middleware/controller to continue login process as usual
            next();
        }else{
            // 2fa failed, reject login request, prevent uname/pw validation
            // (user won't know which factor failed)
            res.status(401).json({message: STRINGS.LOGIN_FAILURE});
        }
    }else{
        res.status(200).json({message: STRINGS.MFA_NOT_ENROLLED});
    }
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
        jwt.verify(token, SECRET, (err, decoded) => {
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
    check: check,
    process2fa: process2fa
}