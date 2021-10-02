const About = require('../../models/PostSchema').About;
const STRINGS = require('../../locale/en').STRINGS

const create = async (req, res) => {
    const isDraft = req.query.draft === "true";
    const post = new About(About.fromRequest(req.user._id, req.body, isDraft));
    try {
        await post.save();
        res.send({about: post});
    } catch (err) {
        res.status(500).send(err);
    }
}

const read = async (req, res) => {
    const query = req.user ? {} : {publishedAt: {$ne: null}};
    const about = await About.find(query);
    try {
        res.send({about: about[0]});
    } catch (err) {
        res.status(500).send(err);
    }
}

const update = async (req, res) => {
    const {id, draft} = req.query;
    const isDraft = draft === "true";
    const {title, html, plaintext, displayEditDate, tags, date} = req.body;

    let post = await About.findById(id);

    if(post){
        try {
            const newlyPublished = !post.publishedAt && !isDraft
            post.title = title;
            post.html = html;
            post.plaintext = plaintext;
            post.tags = tags;
            post.editedOn = Date.now();
            post.displayEditDate = displayEditDate;
            if(newlyPublished) post.publishedAt = date || Date.now();

            await post.save();
            res.send({
                about: post
            });
        } catch (err) {
            console.log(err);
            res.status(500).send(STRINGS.EDITABOUT_FAILURE);
        }
    }else{
        res.status(404).send({error: STRINGS.ITEM_NOT_FOUND})
    }
}

module.exports = {
    create: create,
    read: read,
    update: update,
}