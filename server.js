const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const Post = require('./models/PostSchema').Post;
const About = require('./models/PostSchema').About;
const Album = require('./models/AlbumSchema');
const cookieParser = require('cookie-parser');
const STRINGS = require('./locale/en').STRINGS
const withAuth = require('./middleware').withAuth;
const logout = require('./middleware').logout;
const login = require('./middleware').login;
const checkIsAdmin = require('./middleware').checkIsAdmin;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './photos');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        // rejects storing a file
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// TODO: right now, all registered user can access the ADMIN API! we're assuming the only registered user is the admin!
//  therefore, we must introduce ROLE BASED ACCESS CONTROL in case we want to open registrations to public
require("dotenv").config()

// NOTE: if photos directory does NOT exist in the deployed github branch, photo uploads will fail
// TODO: WRITE CODE TO MAKE SURE THESE DIRECTORIES EXIST
app.use(express.json()); // same as express.bodyParser
app.use(express.static(path.join(__dirname, "client", "build")))
app.use(express.static(path.join(__dirname, "client", "public", "static")))
app.use(express.static(path.join(__dirname, "photos")))
app.use(cookieParser());
app.set('json spaces', 2);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

//TODO: change res.statusCode === 200 to req.loggedin

app.post('/login', login);

app.get('/isAdmin', withAuth, checkIsAdmin);

app.get('/logout', withAuth, logout);

/**
 * Get the feed.
 */
app.get('/feed', async function (req, res) {
    const posts = await Post.find({}).sort({createdOn: -1});
    try {
        res.send(posts);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/about', async function (req, res) {
    const about = await About.find({})
    try {
        res.send({about: about[0]});
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/gallery', withAuth, async function (req, res) {
    // if not logged in, don't send hidden albums
    let albums = res.statusCode === 200 ? await Album.find({}).sort({createdOn: -1}) :
                                          await Album.find({hidden: false}).sort({createdOn: -1});
    try {
        res.send(albums);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/post', withAuth, async (req, res) => {
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

app.post('/postAbout', withAuth, async (req, res) => {
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

app.put('/edit', withAuth, async (req, res) => {
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

app.put('/editAbout', withAuth, async (req, res) => {
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

app.delete('/delete', withAuth, async (req, res) => {
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
    }else if(statusCode === 401){
        res.status(401).send(STRINGS.DELETEPOST_AUTH_FAILURE)
    }else{
        res.send()
    }
});

app.post('/uploadImage', upload.single('image'), function (req, res, next) {
    let raw =
        {
            data: {
                // TODO: change host as required
                // use full path if necessary e.g. http://localhost:4000/ filename etc
                link: webhost + req.file.filename
            },
            status: 200,
            success: true,
        }
    res.send(raw)
})

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

/**
 * START APP
 * @type {string}
 */
const webhost = process.env.WEBHOST || "http://localhost:4000/"
const port = process.env.PORT || 4000
const mongo_user = process.env.MONGO_USER || "devuser";
const mongo_pass = process.env.MONGO_PASS || "devpass";
const mongo_host = process.env.MONGO_HOST || "cluster0-60whi.mongodb.net";
const uri = "mongodb+srv://" + mongo_user + ":" + mongo_pass + "@" + mongo_host + "/test?retryWrites=true&w=majority"

mongoose.connect(uri, function(err) {
    if (err) return console.log(err);
    app.listen(port, () => console.log(`Listening on port ${port}`));
});
