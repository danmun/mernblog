let slugify = require('slugify');

/**
 * Populate the slug field on Post model.
 * @param db
 * @param next
 */
exports.up = function(db, next){
    updateSlug(false, db, next)
};

exports.down = function(db, next){
    updateSlug(true, db, next)
};

const updateSlug = (nullify, db, next) => {
    const posts = db.collection('posts');
    posts.find({}, async (err, docs) => {
        const items = await docs.toArray();
        for(const item of items){
            item.slug = nullify ? null : slugify(item.title);
            await posts.save(item);
        }
        next();
    })
}