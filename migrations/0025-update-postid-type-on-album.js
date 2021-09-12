const mongoose = require('mongoose')
/**
 * Update type of post ID from String to ObjectID on Album model.
 * Convert the existing post ID of the album from String to ObjectID.
 * @param db
 * @param next
 */
exports.up = function(db, next){
    findAndCast(mongoose.Types.ObjectId, db, next);
};

exports.down = function(db, next){
    findAndCast(String, db, next)
};

const findAndCast = (Type, db, next) => {
    const albums = db.collection('albums');
    albums.find({post: {$exists: true}}, async (err, docs) => {
        const items = await docs.toArray();
        for(const item of items){
            item.post = Type(item.post);
            await albums.save(item);
        }
        next();
    })
}
