const Album = require('../../models/AlbumSchema');

const index = async (req, res) => {
    // req.user is provided by auth middleware
    // if not logged in, don't send hidden albums
    const query = req.user ? {} : {hidden: false};
    const sort = {createdOn: -1};
    let albums = await Album.find(query).sort(sort);
    try {
        res.send(albums);
    } catch (err) {
        res.status(500).send(err);
    }
}

const read = async (req, res) => {
    const {id} = req.query
    let query = req.user ? {_id: id} : {hidden: false, _id: id};
    let album = await Album.findOne(query);
    try {
        // TODO:CLEANUP if !album, send not found (implement a generic 404 mechanism)
        res.send(album);
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports = {
    index: index,
    read: read
}