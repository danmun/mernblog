// https://stackoverflow.com/questions/34837489/how-can-convert-string-to-date-with-mongo-aggregation
// https://docs.mongodb.com/manual/reference/operator/aggregation/dateFromString/

exports.up = function(db, next){
    console.log("Pushing up ...")
    db.collection('posts').updateMany({}, [{ $set: { publishedAt: '$createdOn' } }], {}, next)
};

exports.down = function(db, next){
    console.log("Rolling back ...")
    db.collection('posts').updateMany({}, { $set: { "publishedAt": null } }, {}, next)
};
