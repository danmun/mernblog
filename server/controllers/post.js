const Post = require('../../models/PostSchema').Post;
const Album = require('../../models/AlbumSchema');
const STRINGS = require('../../locale/en').STRINGS

/**
 * Post controllers.
 * It is assumed that some of these controllers functions are preceded by middleware that handle authn/authz
 * and the insertion of the user object into the request context (req.user).
 */

/**
 * Show all published posts to public.
 * Show draft posts too if user is logged in.
 * @param req
 * @param res
 * @returns {NodeJS.Global.Promise<void>}
 */
const index = async (req, res) => {
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
}

/**
 * Create a post.
 * @param req
 * @param res
 * @returns {NodeJS.Global.Promise<void>}
 */
const create = async (req, res) => {
    const isDraft = req.query.draft === "true";
    // TODO:CLEANUP validate form content
    const postParams = await Post.fromRequest(req.user._id, req.body, isDraft);
    const post = new Post(postParams);

    try {
        await post.save();
    } catch (err) {
        res.status(500).send(err);
        return;
    }

    // draft post's album gets created on /edit endpoint, when draft is published
    if(req.body.album === null || isDraft){
        res.send({
            status: isDraft ? STRINGS.NEWDRAFT_SUCCESS : STRINGS.NEWPOST_SUCCESS,
            post: post
        });
        return;
    }

    const album = new Album(Album.fromRequest(req.user._id, req.body, post));
    try{
        await album.save();
        res.send({
            status: STRINGS.NEWPOST_SUCCESS,
            post: post
        });
    } catch (err){
        res.status(500).send(err);
    }
}

const readHelper = async (query, req, res) => {
    const post = await Post.findOne(query);
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
}


/**
 * Return a single post given its ID.
 * @param req
 * @param res
 * @returns {NodeJS.Global.Promise<void>}
 */
const readById = async (req, res) =>  {
    const {id} = req.query;
    const query = req.user ? {_id: id} : {_id: id, publishedAt: {$ne: null}};
    readHelper(query, req, res);
}

/**
 * Return a single post given its slug.
 * @param req
 * @param res
 * @returns {NodeJS.Global.Promise<void>}
 */
const readBySlug = async (req, res) =>  {
    const {slug} = req.query;
    const query = req.user ? {slug} : {slug: slug, publishedAt: {$ne: null}};
    readHelper(query, req, res);
}

/**
 * Update a post.
 * A.k.a post editing
 * @param req
 * @param res
 * @returns {NodeJS.Global.Promise<void>}
 */
const update = async (req, res) => {
    const {id, draft} = req.query;
    // NOTE: query params are STRINGS!!
    // e.g. req.query.draft is not a boolean, it is a string, so !isDraft did not work
    const isDraft = draft === "true"
    // form here represents the post being edited
    const form = req.body;

    // TODO:CLEANUP add null checking of resources to all endpoints
    //              e.g. post = await Post.findById(id)
    //                   post !== null && post.validDocument?
    let post = await Post.findById(id);
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
                const album = new Album(Album.fromRequest(req.user._id, form, post));
                await album.save();
            }
        }
        await post.save();
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
}

/**
 * Delete a post.
 * Function is named `del` as `delete` is a reserved JS keyword.
 * @param req
 * @param res
 * @returns {NodeJS.Global.Promise<void>}
 */
const del = async (req, res) => {
    const {id} = req.query;
    Post.remove({ _id: id }, function(err) {
        if (!err) {
            res.send({
                status: STRINGS.DELETEPOST_SUCCESS,
            });
        } else {
            console.log(err);
            res.status(500).send(err);
        }
    });
}

module.exports = {
    index: index,
    create: create,
    readById: readById,
    readBySlug: readBySlug,
    update: update,
    // although object properties are allowed to be reserved keywords, like `delete`,
    // it's best to avoid using reserved keywords as names entirely
    del: del
}