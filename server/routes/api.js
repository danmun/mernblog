const express = require('express')
const apiRouter = express.Router()

const post = require('../controllers/post');
const about = require('../controllers/about');
const album = require('../controllers/album');
const features = require('../controllers/features');
const user = require('../controllers/user');

const auth = require('../middleware/auth')

const resourceRoutes = {
    Post: '/post',
    About: '/about',
    Album: '/gallery',
    MfaEnrolment: '/2fa'
}

apiRouter.post('/login', auth.process2fa, user.login);
apiRouter.get('/isAdmin', auth.check, user.isAdmin);
apiRouter.get('/logout', auth.enforce, user.logout);

apiRouter.get(resourceRoutes.MfaEnrolment, auth.enforce, user.has2fa);
apiRouter.post(resourceRoutes.MfaEnrolment, auth.enforce, user.enrol2fa);
apiRouter.put(resourceRoutes.MfaEnrolment, auth.enforce, user.confirm2fa);
apiRouter.delete(resourceRoutes.MfaEnrolment, auth.enforce, user.remove2fa);

// auth.enforce guarantees that req.user exists,
// otherwise it would throw a 401 and the next function in the chain (e.g. post.create) would not execute
apiRouter.get('/feed', auth.check, post.index);
apiRouter.get(resourceRoutes.Post, auth.check, post.readBySlug);
apiRouter.post(resourceRoutes.Post, auth.enforce, post.create);
apiRouter.put(resourceRoutes.Post, auth.enforce, post.update);
apiRouter.delete(resourceRoutes.Post, auth.enforce, post.del);

apiRouter.get(resourceRoutes.About, auth.check, about.read);
apiRouter.post(resourceRoutes.About, auth.enforce, about.create);
apiRouter.put(resourceRoutes.About, auth.enforce, about.update);

apiRouter.get(resourceRoutes.Album, auth.check, album.index);
apiRouter.get(`${resourceRoutes.Album}/album`, auth.check, album.read);

apiRouter.get('/seen', features.lastSeen);
apiRouter.get('/getImgurClientId', auth.enforce, features.imgurClientId)

module.exports = apiRouter;