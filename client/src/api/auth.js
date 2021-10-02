let baseUrl = require("./config.json").baseUrl;

export async function login(form) {
    return await fetch(`${baseUrl}/login`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) =>
            res.json().then((json) => {
                json.success = res.ok;
                return json;
            })
        )
        .then((json) => json);
}

export async function logout() {
    const response = await fetch(`${baseUrl}/logout`, {
        credentials: "include",
    });
    return response.status === 200;
}

export async function checkLoggedIn() {
    const isAdmin = await fetch(`${baseUrl}/isAdmin`, {
        credentials: "include",
    })
        .then((raw) => {
            return raw.json();
        })
        .then((res) => {
            return res.isAdmin;
        });
    return isAdmin;
}

export async function getImgurClientId() {
    return await fetch(`${baseUrl}/getImgurClientId`, {
        credentials: "include",
    })
        .then((raw) => {
            return raw.json();
        })
        .then((res) => {
            return res.imgur_client_id;
        })
        .catch((err) => {
            console.error(err);
            return err;
        });
}
