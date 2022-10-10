const express = require('express');
const app = express();
const helmet = require('helmet');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const api = require('./server/routes/api');
const redirectIdBasedLinks = require('./server/middleware/redirects')

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

const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            // https://stackoverflow.com/a/65894606
            "script-src": ["'self'", "'unsafe-inline'"],
            // https://stackoverflow.com/a/65334628
            "img-src": [
                "'self'",
                "data:",
                "i.imgur.com",
                "localhost",
                "drive.google.com",
                "chart.googleapis.com",
                "*.googleusercontent.com",
                "docs.google.com",
                "wanderingblog.herokuapp.com",
                "wanderingblog-playground.herokuapp.com"]
        },
    },
}
// TODO: delete this line once we have SSL cert
delete helmetConfig.contentSecurityPolicy.directives['upgrade-insecure-requests'];

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

require("dotenv").config();

// NOTE: heroku filesystem is not persistent; not suitable for serving user uploaded content
app.use(express.json()); // same as express.bodyParser
// index fix based on https://stackoverflow.com/a/46204364
app.use(express.static(path.join(__dirname, "client", "build"),{ index : false }));
app.use(express.static(path.join(__dirname, "client", "public", "static"), { index : false }));
app.use(express.static(path.join(__dirname, "photos")));
app.use(cookieParser());
app.set('json spaces', 2);

app.use(redirectIdBasedLinks)
app.use(helmet(helmetConfig));
app.use('/api', api);
// should always be last route in this file
// so that it catches non-api routes (e.g. request to load the spa)
app.get("*", (req, res) => {
    if(req.hostname.includes(process.env.HEROKUAPP_HOSTNAME)){
        res.status(418).send({hello: "Nothing here... hmm..."});
    }else{
        res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    }
});
/**
 * START APP
 * @type {string}
 */
let dev_config = {};
const fs = require('fs');
const dev_config_import = './dev_config';

try {
    dev_config = {
        WEBHOST: "http://localhost:4000/",
        PORT: 4000,
        IMGUR_CLIENT_ID: "none",
        MONGO_USER: "user",
        MONGO_PASS: "pass",
        MONGO_HOST: "mongodb.com"
    };
    if (fs.existsSync(dev_config_import + ".js")) {
        dev_config = require(dev_config_import);
    }
} catch(err) {
    console.log(err);
}
const port = process.env.PORT || dev_config.PORT;
const mongo_user = process.env.MONGO_USER || dev_config.MONGO_USER;
const mongo_pass = process.env.MONGO_PASS || dev_config.MONGO_PASS;
const mongo_host = process.env.MONGO_HOST || dev_config.MONGO_HOST;
const uri = "mongodb+srv://" + mongo_user + ":" + mongo_pass + "@" + mongo_host + "/test?retryWrites=true";
// &w=majority

mongoose.connect(uri, function(err) {
    if (err) return console.log(err);
    app.listen(port, () => console.log(`Listening on port ${port}`));
});
