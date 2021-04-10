let baseUrl = require("./config.json").baseUrl;

export async function fetchFeed() {
    return await fetch(`${baseUrl}/feed`)
        // We get the API response and receive data in JSON format...
        .then((response) => response.json())
        // json is the final variable returned
        .then((json) => json);
}
