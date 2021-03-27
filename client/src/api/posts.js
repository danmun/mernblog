let baseUrl = require('./config.json').baseUrl;

export async function fetchPost(id){
    return await fetch(`${baseUrl}/post?id=${id}`,
        {
            credentials: 'include'
        })
        .then(raw => raw.json())
        .then(json => json)
}

export async function createPost(post){
    return fetch(`${baseUrl}/post`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(post)
    }).then(function(response) {
        return response;
    })
}

export async function editPost(post){
    return await fetch(`${baseUrl}/edit?id=${post.id}`,
        {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(post)
        })
        .then(raw => raw.json())
        .then(json => json)
}

export async function deletePost(post){
    return await fetch(`${baseUrl}/delete?id=${post._id}`, {
        method: 'DELETE',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(post)
    }).then(function(response) {
        return response;
    })
}