let mongoose = require('mongoose');
const shortid = require('shortid');
let slugify = require('slugify');

// note: if a field is not required:true, it will not show up in API responses until it specifically set on the model
let PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
    },
    html: {
        type: String,
        required: true,
    },
    plaintext: {
        type: String,
        required: true,
    },
    tags: {
        type : Array,
        default : [],
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now,
        required: true,
    },
    editedOn: {
        type: Date,
        required: false,
    },
    publishedAt: {
        type: Date,
        required: false
    },
    displayEditDate: {
        type: Boolean,
        required: false,
        default: false
    },
    numComments: {
        type: Number,
        default: 0,
        required: true,
    },
    slug: {
        type: String,
        unique: true
    },
});

PostSchema.statics.createSlug = async function(title){
    let slug = slugify(title)
    const random = shortid.generate();
    const post = await Post.findOne({slug});
    return post ? `${slug}-${random}` : slug;
}

PostSchema.statics.fromRequest = async function(userId, form, draft){
    const {title, html, date, plaintext, tags} = form;
    const slug = await PostSchema.statics.createSlug(title);
    return {
            user: userId,
            title: title,
            html: html,
            plaintext: plaintext,
            tags: tags,
            publishedAt: draft ? null : (date ? date : Date.now()),
            numComments: 0,
            slug: slug
    }
}

const Post = mongoose.model('Post', PostSchema);
const About = mongoose.model('About', PostSchema);
module.exports = {
    Post: Post,
    About: About
}