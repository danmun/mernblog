const About = require('./models/PostSchema').About;
const STRINGS = require('./locale/en').STRINGS

const create = async (req, res) => {
    const post = new About(About.fromRequest(req.user._id, req.body, false));
    try {
        await post.save();
        res.send({about: about});
    } catch (err) {
        res.status(500).send(err);
    }
}

const read = async (req, res) => {
    const about = await About.find({});
    try {
        res.send({about: about[0]});
    } catch (err) {
        res.status(500).send(err);
    }
}

const update = async (req, res) => {
    const {id} = req.query;
    const {title, html, plaintext, tags} = req.body;

    // TODO:CLEANUP refactor to match await/async resource fetching in other endpoints
    //              e.g.     let about = await About.findById(postId); instead of using callbacks like here
    About.findById(id, function(err, post) {
        if (!err) {
            try {
                post.title = title;
                post.html = html;
                post.plaintext = plaintext;
                post.tags = tags;
                post.editedOn = Date.now();

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
}

module.exports = {
    create: create,
    read: read,
    update: update,
}