let baseUrl = require("./config.json").baseUrl;

export async function check() {
    return await makeRequest(null, "GET");
}

export async function enrol(form) {
    return await makeRequest(form, "POST");
}

export async function confirm(form) {
    return await makeRequest(form, "PUT");
}

export async function remove(form) {
    return await makeRequest(form, "DELETE");
}

// We want to append the status to the payload received from backend.
// Backend already sends status via res.status(200/401/etc), so it is
// redundant for the backend to put it into the res payload too.
// Various ways to do it on frontend: https://stackoverflow.com/questions/47267221/fetch-response-json-and-response-status
// Another way is noted in scratch/random.js.
const makeRequest = async (form, method) => {
    const params = {
        method: method,
        headers: { "Content-Type": "application/json" },
    };
    if (form) params.body = JSON.stringify(form);
    return await fetch(`${baseUrl}/2fa`, params)
        .then((res) =>
            res.json().then((json) => {
                json.success = res.ok;
                return json;
            })
        )
        .then((json) => json);
};
