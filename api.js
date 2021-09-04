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

function constructPost(user, form){
    return(
        {
            user: user._id,
            title: form.title,
            html: form.html,
            plaintext: form.plaintext,
            tags: form.tags,
            createdOn: form.date,
            editedOn: null,
            numComments: "0"
        }
    )
}

function constructAlbum(user, form){
    let albumDetails = form.album;
    return(
        {
            user: user._id,
            title: albumDetails.title ? albumDetails.title : new Date(form.date).toLocaleString(),
            photos: albumDetails.photos,
            thumb: albumDetails.photos[0], //first photo can be thumb
            createdOn: form.date, //same create date as post
            hidden: albumDetails.hidden
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
apiRouter.get('/feed', async function (req, res) {
    const posts = await Post.find({}).sort({createdOn: -1});
    try {
        res.send(posts);
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.get('/post', async function (req, res) {
    const post = await Post.findOne({_id: req.query.id});
    if(post){
        try {
            res.send(post);
        } catch (err) {
            res.status(500).send(err);
        }
    }else{
        try {
            res.status(404).send({error: "This post no longer exists."})
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
    const post = new Post(constructPost(req.user, req.body));
    try {
        await post.save();
    } catch (err) {
        res.status(500).send(err);
        return;
    }

    // if post doesn't have any albums, we can return response to the user
    if(req.body.album === null){
        res.send(STRINGS.NEWPOST_SUCCESS);
        return;
    }

    let albumDetails = constructAlbum(req.user, req.body)
    albumDetails.post = post._id;
    const album = new Album(albumDetails);
    try{
        await album.save();
        res.send(STRINGS.NEWPOST_SUCCESS);
    } catch (err){
        res.status(500).send(err);
    }
});

apiRouter.post('/postAbout', enforceAuth, async (req, res) => {
    let about = constructPost(req.user, req.body);
    const post = new About(about);
    try {
        await post.save();
        res.send({about: about});
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.put('/edit', enforceAuth, async (req, res) => {
    const postId = req.query.id;
    const newPost = req.body;
    delete newPost['id'];
    newPost.editedOn = Date.now();

    // TODO: if photos are added or removed to the post using THIS endpoint,
    //  it should NOT affect the originally created album.
    //  Editing albums should be started from the Album page/endpoint.
    Post.findById(postId, function(err, post) {
        if (!err) {
            try {
                post.title = newPost.title;
                post.html = newPost.html;
                post.plaintext = newPost.plaintext;
                post.tags = newPost.tags;
                post.editedOn = newPost.editedOn;
                post.displayEditDate = newPost.displayEditDate;

                post.save();
                res.send({
                    status: STRINGS.EDITPOST_SUCCESS,
                    post: post
                });
            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
        }else{
            res.send(STRINGS.EDITPOST_FAILURE);
        }
    })
});

apiRouter.put('/editAbout', enforceAuth, async (req, res) => {
    const postId = req.query.id;
    const newPost = req.body;
    delete newPost['id'];
    newPost.editedOn = Date.now();

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

apiRouter.delete('/delete', enforceAuth, async (req, res) => {
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