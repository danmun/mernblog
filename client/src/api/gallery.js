let baseUrl = require('./config.json').baseUrl;

export async function fetchGallery(){
    return fetch(`${baseUrl}/gallery`)
        .then(response => response.json())
        .then(json => json)
}