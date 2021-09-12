/**
 * Populate the user field on About model.
 * @param db
 * @param next
 */
exports.up = function(db, next){
    console.log("Pushing up ...")
    const collection = db.collection('users');

    collection.find({}, async (err, info) => {
        let users = await info.toArray();
        db.collection('abouts').updateMany({}, [{ $set: { user: users[0]._id } }], {}, next)
    });
};

exports.down = function(db, next){
    console.log("Rolling back ...")
    db.collection('abouts').updateMany({}, [{ $set: { user: null } }], {}, next)
};