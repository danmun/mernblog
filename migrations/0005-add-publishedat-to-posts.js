// https://stackoverflow.com/questions/66686022/updatemany-in-mongodb-using-value-of-other-field
// https://docs.mongodb.com/manual/reference/operator/aggregation/dateFromString/

exports.up = function(db, next){
    console.log("Pushing up ...")
    db.collection('posts').updateMany({}, [{ $set: { publishedAt: '$createdOn' } }], {}, next)
};

exports.down = function(db, next){
    console.log("Rolling back ...")
    db.collection('posts').updateMany({}, { $set: { "publishedAt": null } }, {}, next)
};
