var express = require('express')
var apiRouter = express.Router()
const Post = require('./models/PostSchema').Post;
const About = require('./models/PostSchema').About;
const Album = require('./models/AlbumSchema');
const STRINGS = require('./locale/en').STRINGS
const withAuth = require('./middleware').withAuth;
const logout = require('./middleware').logout;
const login = require('./middleware').login;
const checkIsAdmin = require('./middleware').checkIsAdmin;

let dev_config = {}
const fs = require('fs')
const dev_config_import = './dev_config'
try {
    dev_config = {
        WEBHOST: "http://localhost:4000/",
        PORT: 4000,
        IMGUR_CLIENT_ID: "none",
        MONGO_USER: "user",
        MONGO_PASS: "pass",
        MONGO_HOST: "mongodb.com"
    }
    if (fs.existsSync(dev_config_import + ".js")) {
        dev_config = require(dev_config_import)
    }
} catch(err) {
    console.log(err)
}

const imgur_client_id = process.env.IMGUR_CLIENT_ID || dev_config.IMGUR_CLIENT_ID

function constructPost(form){
    return(
        {
            user: 1, // TODO: change this to logged in user. . .
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

function constructAlbum(form){
    let albumDetails = form.album
    return(
        {
            user: 1,
            title: albumDetails.title ? albumDetails.title : new Date(form.date).toLocaleString(),
            photos: albumDetails.photos,
            thumb: albumDetails.photos[0], //first photo can be thumb
            createdOn: form.date, //same create date as post
            hidden: albumDetails.hidden
        }
    )
}

apiRouter.post('/login', login);

apiRouter.get('/isAdmin', withAuth, checkIsAdmin);

apiRouter.get('/logout', withAuth, logout);

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
    const post = await Post.findOne({_id: req.query.id})
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
    const about = await About.find({})
    try {
        res.send({about: about[0]});
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.get('/gallery/album', withAuth, async function (req, res) {
    // res.statusCode === 200 is our current way of checking if user is logged in (see withAuth)
    // refactor this mechanism IMMEDIATELY as it is intuitive, illogical, and causes unnecessary 401s!!!
    // e.g. in withAuth, put the user object into res
    let properties = res.statusCode === 200 ? {_id: req.query.id} : {hidden: false, _id: req.query.id}
    let album = await Album.findOne(properties)
    try {
        // TODO: if !album, send not found (implement a generic 404 mechanism)
        console.log("sending", album)
        res.send(album);
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.get('/gallery', withAuth, async function (req, res) {
    // if not logged in, don't send hidden albums
    let albums = res.statusCode === 200 ? await Album.find({}).sort({createdOn: -1}) :
        await Album.find({hidden: false}).sort({createdOn: -1});
    try {
        res.send(albums);
    } catch (err) {
        res.status(500).send(err);
    }
});

apiRouter.post('/post', withAuth, async (req, res) => {
    if(res.statusCode === 200){
        // prep and save the post
        const post = new Post(constructPost(req.body));
        try {
            await post.save();
        } catch (err) {
            res.status(500).send(err);
            return
        }

        // if post doesn't have any albums, we can return response to the user
        if(req.body.album === null){
            res.send(STRINGS.NEWPOST_SUCCESS);
            return
        }

        let albumDetails = constructAlbum(req.body)
        albumDetails.post = post._id
        const album = new Album(albumDetails)
        try{
            await album.save();
            res.send(STRINGS.NEWPOST_SUCCESS);
        } catch (err){
            res.status(500).send(err);
        }
    }else if(res.statusCode === 401){
        res.status(401).send(STRINGS.NEWPOST_AUTH_FAILURE)
    }else{
        res.send()
    }
});

apiRouter.post('/postAbout', withAuth, async (req, res) => {
    if(res.statusCode === 200){
        let about = constructPost(req.body)
        const post = new About(about);
        try {
            await post.save();
            res.send({about: about});
        } catch (err) {
            res.status(500).send(err);
        }
    }else if(res.statusCode === 401){
        res.status(401).send(STRINGS.NEWABOUT_AUTH_FAILURE)
    }else{
        res.send()
    }
});

apiRouter.put('/edit', withAuth, async (req, res) => {
    if(res.statusCode === 200){
        const postId = req.query.id
        const newPost = req.body
        delete newPost['id'];
        newPost.editedOn = Date.now()

        // TODO: if photos are added or removed to the post using THIS endpoint,
        //  it should NOT affect the originally created album.
        //  Editing albums should be started from the Album page/endpoint.
        Post.findById(postId, function(err, post) {
            if (!err) {
                try {
                    post.title = newPost.title
                    post.html = newPost.html
                    post.plaintext = newPost.plaintext
                    post.tags = newPost.tags
                    post.editedOn = newPost.editedOn
                    post.displayEditDate = newPost.displayEditDate

                    post.save()
                    res.send({
                        status: STRINGS.EDITPOST_SUCCESS,
                        post: post
                    });
                } catch (err) {
                    console.log(err)
                    res.status(500).send(err);
                }
            }else{
                res.send(STRINGS.EDITPOST_FAILURE);
            }
        })
    }else if(res.statusCode === 401){
        res.status(401).send(STRING.EDITPOST_AUTH_FAILURE)
    }else{
        res.send()
    }
});

apiRouter.put('/editAbout', withAuth, async (req, res) => {
    if(res.statusCode === 200){
        const postId = req.query.id
        const newPost = req.body
        delete newPost['id'];
        newPost.editedOn = Date.now()

        About.findById(postId, function(err, post) {
            if (!err) {
                try {
                    post.title = newPost.title
                    post.html = newPost.html
                    post.plaintext = newPost.plaintext
                    post.tags = newPost.tags
                    post.editedOn = newPost.editedOn

                    post.save()
                    res.send({
                        about: post
                    });
                } catch (err) {
                    console.log(err)
                    res.status(500).send(err);
                }
            }else{
                res.send(STRINGS.EDITABOUT_FAILURE);
            }
        })
    }else if(res.statusCode === 401){
        res.status(401).send(STRINGS.EDITABOUT_AUTH_FAILURE)
    }else{
        res.send()
    }
});

apiRouter.delete('/delete', withAuth, async (req, res) => {
    if(res.statusCode === 200){
        const postId = req.query.id

        Post.remove({ _id: postId }, function(err) {
            if (!err) {
                res.send({
                    status: STRINGS.DELETEPOST_SUCCESS,
                });
            }
            else {
                console.log(err)
                res.status(500).send(err);
            }
        });
    }else if(res.statusCode === 401){
        res.status(401).send(STRINGS.DELETEPOST_AUTH_FAILURE)
    }else{
        res.send()
    }
});

// todo: query imgur client id while logged in, then upload image
apiRouter.get('/getImgurClientId', withAuth, function (req, res, next) {
    if(res.statusCode === 200){
        res.send({
            imgur_client_id: imgur_client_id
        })
    }else{
        res.send(STRINGS.IMGUR_ID_REQUEST_AUTH_FAILURE)
    }
})

module.exports = apiRouter