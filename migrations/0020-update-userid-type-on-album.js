/**
 * Update type of user ID from Number to ObjectID on Album model.
 * The ID taken from User is already ObjectID type, so no further conversion is needed.
 * @param db
 * @param next
 */
exports.up = function(db, next){
    const collection = db.collection('users');

    collection.find({}, async (err, info) => {
        let users = await info.toArray();
        db.collection('albums').updateMany({}, [{ $set: { user: users[0]._id } }], {}, next)
    });
};

exports.down = function(db, next){
    db.collection('albums').updateMany({}, [{ $set: { user: 1} }], {}, next)
};
