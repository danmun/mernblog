let mongoose = require('mongoose');
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
        type : Array ,
        default : [],
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now(),
        required: true,
    },
    editedOn: {
        type: Date,
        required: false,
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
    }
});

const Post = mongoose.model('Post', PostSchema);
const About = mongoose.model('About', PostSchema);
module.exports = {
    Post: Post,
    About: About
}