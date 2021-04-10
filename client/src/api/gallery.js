let baseUrl = require("./config.json").baseUrl;

export async function fetchGallery() {
    return fetch(`${baseUrl}/gallery`)
        .then((response) => response.json())
        .then((json) => json);
}

export async function fetchAlbum(id) {
    return fetch(`${baseUrl}/gallery/album?id=${id}`)
        .then((response) => response.json())
        .then((json) => json);
}
