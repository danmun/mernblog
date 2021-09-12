/**
 * Add publishedAt field on Abouts by setting it to the existing createdOn value.
 * @param db
 * @param next
 */
exports.up = function(db, next){
    console.log("Pushing up ...")
    db.collection('abouts').updateMany({}, [{ $set: { publishedAt: '$createdOn' } }], {}, next)
};

exports.down = function(db, next){
    console.log("Rolling back ...")
    db.collection('abouts').updateMany({}, { $set: { "publishedAt": null } }, {}, next)
};
