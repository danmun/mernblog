let baseUrl = require("./config.json").baseUrl;

export async function fetchAbout() {
    return await fetch(`${baseUrl}/about`)
        .then((raw) => raw.json())
        .then((json) => json);
}

export async function editAbout(post, draft) {
    return await fetch(`${baseUrl}/about?id=${post.id}&draft=${draft}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
    })
        .then((raw) => raw.json())
        .then((json) => json);
}

export async function createAbout(post, draft) {
    return await fetch(`${baseUrl}/about?draft=${draft}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
    })
        .then((raw) => raw.json())
        .then((json) => json);
}
