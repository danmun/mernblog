let baseUrl = require("./config.json").baseUrl;

export async function fetchSeen() {
    return await fetch(`${baseUrl}/seen`)
        .then((raw) => raw.json())
        .then((json) => json);
}
