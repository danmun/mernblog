const Post = require('../../models/PostSchema').Post;
const GitHub = require('github-api');
const moment = require('moment');

let dev_config = {}
const fs = require('fs')
const dev_config_import = '../../dev_config'
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

const lastSeen = async (req, res) => {
    const posts = await Post.find({publishedAt: {$ne: null}}).sort({publishedAt: -1}).limit(1);
    const post = posts[0];
    const date = post.publishedAt ? post.publishedAt : post.createdOn;
    const lastPost = {
        date: moment(date).fromNow(),
        title: post.title
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
        console.warn("GitHub unavailable or rate limit exceeded.");
    }

    try {
        res.send({lastPost, lastCommit});
    } catch (err) {
        res.status(500).send(err);
    }
}

const imgurClientId = (req, res, next) => {
    res.send({
        imgur_client_id: imgur_client_id
    })
}

module.exports = {
    lastSeen: lastSeen,
    imgurClientId: imgurClientId
}