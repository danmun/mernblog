let mongoose = require('mongoose');
let AlbumSchema = new mongoose.Schema({
    // TODO:CLEANUP change to mongoose.Schema.Types.ObjectId, create migration
    user: {
        type: Number, // the user id whom the app belongs to, could be remodelled later
        required: true,
        trim: true
    },
    // TODO:CLEANUP change to mongoose.Schema.Types.ObjectId, create migration
    post: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    tags: {
        type: String,
        required: false,
    },
    createdOn: {
        type: Date,
        required: true,
    },
    thumb: {
        type: String,
        required: true,
    },
    photos: {
        type: Array,
        required: true,
    },
    hidden: {
        type: Boolean,
        required: true,
        default: true
    }
});

AlbumSchema.statics.fromRequest = function(userId, form, post){
    const {title, photos, hidden} = form.album;
    const albumTitle = title ? title : new Date(post.publishedAt).toLocaleString()
    return {
            post: post._id,
            user: userId,
            title: albumTitle,
            photos: photos,
            thumb: photos[0],
            // album is only created when post is published,
            // so publishedAt will not be null here
            createdOn: post.publishedAt,
            hidden: hidden
    }
}

const Album = mongoose.model('Album', AlbumSchema);
module.exports = Album;