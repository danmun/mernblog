exports.up = function(db, next){
    console.log("Pushing up ...")
    db.collection('abouts').updateMany({}, [{ $set: { publishedAt: '$createdOn' } }], {}, next)
};

exports.down = function(db, next){
    console.log("Rolling back ...")
    db.collection('abouts').updateMany({}, { $set: { "publishedAt": null } }, {}, next)
};
