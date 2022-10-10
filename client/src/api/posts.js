let baseUrl = require("./config.json").baseUrl;

export async function fetchPostById(id) {
    return await fetch(`${baseUrl}/post?id=${id}`, {
        credentials: "include",
    })
        .then((raw) => raw.json())
        .then((json) => json);
}

export async function fetchPostBySlug(id) {
    return await fetch(`${baseUrl}/post?slug=${id}`, {
        credentials: "include",
    })
        .then((raw) => raw.json())
        .then((json) => json);
}

export async function createPost(post, draft) {
    return fetch(`${baseUrl}/post?draft=${draft}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
    }).then(function (response) {
        return response;
    });
}

export async function editPost(post, draft) {
    return await fetch(`${baseUrl}/post?id=${post.id}&draft=${draft}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
    })
        .then((raw) => raw.json())
        .then((json) => json);
}

export async function deletePost(post) {
    return await fetch(`${baseUrl}/post?id=${post._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
    }).then(function (response) {
        return response;
    });
}
