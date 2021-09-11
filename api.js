var express = require('express')
var apiRouter = express.Router()
const Post = require('./models/PostSchema').Post;
const About = require('./models/PostSchema').About;
const Album = require('./models/AlbumSchema');
const STRINGS = require('./locale/en').STRINGS
const enforceAuth = require('./middleware').enforceAuth;
const checkAuth = require('./middleware').checkAuth;
const logout = require('./middleware').logout;
const login = require('./middleware').login;
const GitHub = require('github-api');
const moment = require('moment');

let dev_config = {}
const fs = require('fs')
const dev_config_import = './dev_config'
try {
    dev_config = {
        IMGUR_CLIENT_ID: "none",
    }
    if (fs.existsSync(dev_config_import + ".js")) {
        dev_config = require(dev_config_import)
    }
} catch(err) {
    console.log(err)
}

const imgur_client_id = process.env.IMGUR_CLIENT_ID || dev_config.IMGUR_CLIENT_ID

function constructPost(userId, form, draft){
    const {title, html, date, plaintext, tags} = form;
    return(
        {
            user: userId,
            title: title,
            html: html,
            plaintext: plaintext,
            tags: tags,
            publishedAt: draft ? null : (date ? date : Date.now()),
            numComments: "0"
        }
    )
}

// TODO:CLEANUP refactor all functions into constants like
//              e.g. const constructAlbum = (userId, form, post) => { ... }
function constructAlbum(userId, form, post){
    const {title, photos, hidden} = form.album;
    const albumTitle = title ? title : new Date(post.publishedAt).toLocaleString()
    return(
        {
            post: post._id,
            user: userId,
            title: albumTitle,
            photos: photos,
            thumb: photos[0],
            // album is only created when post is published,
            // so publishedAt will not be null here
            createdOn: post.publishedAt,
            hidden: hidden
        }
    )
}

apiRouter.post('/login', login);

apiRouter.get('/isAdmin', checkAuth, (req, res) => {
    res.send({
        "isAdmin": !!req.user
    })
});

apiRouter.get('/logout', enforceAuth, logout);

/**
 * Get the feed.
 */
apiRouter.get('/feed', checkAuth, async function (req, res) {
    // if admin, show all posts, ordered by createdOn
    // if not admin, show all posts where publishedAt != null, ordered by publishedAt
    let query = req.user ? {} : {publishedAt: {$ne: null}};
    const sort = req.user ? {createdOn: -1} : {publishedAt: -1};
    const posts = await Post.find(query).sort(sort);
    try {
        res.send(posts);
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.get('/post', checkAuth, async function (req, res) {
    const {id} = req.query;
    const post = req.user ? await Post.findOne({_id: id}) : await Post.findOne({_id: id, publishedAt: {$ne: null}});
    if(post){
        try {
            res.send(post);
        } catch (err) {
            res.status(500).send(err);
        }
    }else{
        try {
            res.status(404).send({error: STRINGS.ITEM_NOT_FOUND})
        } catch (err) {
            res.status(500).send(err);
        }
    }
});

apiRouter.get('/about', async function (req, res) {
    const about = await About.find({});
    try {
        res.send({about: about[0]});
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.get('/seen', async function (req, res) {
    const posts = await Post.find({}).sort({publishedAt: -1}).limit(1);

    const lastPost = {
        date: moment(posts[0].createdOn).fromNow(),
        title: posts[0].title
    }

    const lastCommit = {
        date: "Unavailable.",
        url: "https://github.com",
        message: "hmmmm..."
    }
    // get github commit time
    try {
        const gh = new GitHub();
        const repo = gh.getRepo("danmun", "mernblog")
        const commits  = await repo.listCommits()
        const commit = commits.data[0]
        const commitDetails = await repo.getCommit(commit.sha)
        const commitDate = commitDetails.data.author.date
        lastCommit.date = moment(commitDate).fromNow();
        lastCommit.url = commitDetails.data.html_url;
        lastCommit.message = commitDetails.data.message;
    } catch (error) {
        console.error("GitHub unavailable or rate limit exceeded.");
    }

    try {
        res.send({lastPost, lastCommit});
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.get('/gallery/album', checkAuth, async function (req, res) {
    // if user is not logged in, only send the album if it's not hidden
    // req.user comes from the checkAuth middleware
    let query = req.user ? {_id: req.query.id} : {hidden: false, _id: req.query.id};
    let album = await Album.findOne(query);
    try {
        // TODO: if !album, send not found (implement a generic 404 mechanism)
        res.send(album);
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.get('/gallery', checkAuth, async function (req, res) {
    // if not logged in, don't send hidden albums
    const query = req.user ? {} : {hidden: false};
    const sort = {createdOn: -1};
    let albums = await Album.find(query).sort(sort);
    try {
        res.send(albums);
    } catch (err) {
        res.status(500).send(err);
    }
});

// enforceAuth guarantees that req.user exists,
// otherwise it would throw a 401 and this async function would not execute
apiRouter.post('/post', enforceAuth, async (req, res) => {
    // prep and save the post
    const form = req.body;
    const isDraft = req.query.draft === "true";
    const post = new Post(constructPost(req.user._id, form, isDraft));

    try {
        await post.save();
    } catch (err) {
        res.status(500).send(err);
        return;
    }

    // draft post's album gets created on /edit endpoint, when draft is published
    if(req.body.album === null || isDraft){
        res.send(STRINGS.NEWPOST_SUCCESS);
        return;
    }

    const album = new Album(constructAlbum(req.user._id, form, post));
    try{
        await album.save();
        res.send(STRINGS.NEWPOST_SUCCESS);
    } catch (err){
        res.status(500).send(err);
    }
});

apiRouter.post('/about', enforceAuth, async (req, res) => {
    let about = constructPost(req.user, req.body);
    const post = new About(about);
    try {
        await post.save();
        res.send({about: about});
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.put('/post', enforceAuth, async (req, res) => {
    const postId = req.query.id;
    // NOTE: query params are STRINGS!!
    // e.g. req.query.draft is not a boolean, it is a string, so !isDraft did not work
    const isDraft = req.query.draft === "true"
    // form here represents the post being edited
    const form = req.body;
    delete form['id'];

    // TODO:CLEANUP add null checking of resources to all endpoints
    //              e.g. post = await Post.findById(id)
    //                   post !== null && post.validDocument?
    let post = await Post.findById(postId);
    // if stored post is not published and current request is not draft, then we are publishing the post
    const newlyPublished = !post.publishedAt && !isDraft
    try {
        post.title = form.title;
        post.html = form.html;
        post.plaintext = form.plaintext;
        post.tags = form.tags;
        post.editedOn = Date.now();
        post.displayEditDate = form.displayEditDate;

        if(newlyPublished){
            // if publish date specified by user, use that
            post.publishedAt = form.date ? form.date : Date.now();

            if(form.album){
                const album = new Album(constructAlbum(req.user._id, form, post));
                await album.save();
            }
        }
        post.save();
        res.send({
            status: STRINGS.EDITPOST_SUCCESS,
            post: post
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(STRINGS.EDITPOST_FAILURE);
    }

    // TODO: if photos are added or removed to the post using THIS endpoint,
    //  it should NOT affect the originally created album.
    //  Editing albums should be started from the Album page/endpoint.
});

apiRouter.put('/about', enforceAuth, async (req, res) => {
    const postId = req.query.id;
    const newPost = req.body;
    delete newPost['id'];
    newPost.editedOn = Date.now();

    // TODO:CLEANUP refactor to match await/async resource fetching in other endpoints
    //              e.g.     let about = await About.findById(postId); instead of using callbacks like here
    About.findById(postId, function(err, post) {
        if (!err) {
            try {
                post.title = newPost.title;
                post.html = newPost.html;
                post.plaintext = newPost.plaintext;
                post.tags = newPost.tags;
                post.editedOn = newPost.editedOn;

                post.save();
                res.send({
                    about: post
                });
            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
        }else{
            res.send(STRINGS.EDITABOUT_FAILURE);
        }
    })
});

// TODO:CLEANUP rename /delete to /post, this should be a route for .delete('/post')
apiRouter.delete('/post', enforceAuth, async (req, res) => {
    const postId = req.query.id;
    Post.remove({ _id: postId }, function(err) {
        if (!err) {
            res.send({
                status: STRINGS.DELETEPOST_SUCCESS,
            });
        } else {
            console.log(err);
            res.status(500).send(err);
        }
    });
});

// todo: query imgur client id while logged in, then upload image
apiRouter.get('/getImgurClientId', enforceAuth, function (req, res, next) {
    res.send({
        imgur_client_id: imgur_client_id
    })
})

module.exports = apiRouter;