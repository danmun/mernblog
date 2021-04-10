let baseUrl = require("./config.json").baseUrl;

export async function fetchAbout() {
    return await fetch(`${baseUrl}/about`)
        .then((raw) => raw.json())
        .then((json) => json);
}

export async function editAbout(post) {
    return await fetch(`${baseUrl}/editAbout?id=${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
    })
        .then((raw) => raw.json())
        .then((json) => json);
}

export async function newAbout(post) {
    return await fetch(`${baseUrl}/postAbout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
    })
        .then((raw) => raw.json())
        .then((json) => json);
}
