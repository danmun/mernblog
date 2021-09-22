const STRINGS = {
    REGISTER_SUCCESS: "Successfully registered!",
    LOGOUT_FAILURE: "You are not logged in so please don't try to log out.",
    LOGOUT_SUCCESS: "Successfully logged out!",
    LOGIN_FAILURE : "Incorrect username or password.",
    LOGIN_SUCCESS: "Successfully logged in!",
    PASSWORD_FAILURE: "Incorrect password.",

    NEWPOST_SUCCESS: "Successfully posted to the feed!",
    NEWPOST_AUTH_FAILURE: "You must log in to submit new posts.",

    NEWDRAFT_SUCCESS: "Successfully created a draft!",

    IMGUR_ID_REQUEST_AUTH_FAILURE: "You must be logged in to upload images to the blog.",

    EDITPOST_FAILURE: "Something has gone wrong while editing the post.",
    EDITPOST_SUCCESS: "Successfully edited post!",
    EDITPOST_AUTH_FAILURE: "You must log in to edit posts.",

    DELETEPOST_SUCCESS: "Post successfully deleted!",
    DELETEPOST_AUTH_FAILURE: "You must log in to delete posts.",

    NEWABOUT_AUTH_FAILURE: "You must log in to create the About section.",

    EDITABOUT_AUTH_FAILURE: "You must log in to edit the About section.",
    EDITABOUT_FAILURE: "Something has gone wrong while editing the About page.",

    SERVER_ERROR: 'Server error. Please try again later.',
    INVALID_ID: 'The provided ID is malformed.',
    ITEM_NOT_FOUND: 'The requested item was not found.',

    MFA_ALREADY_ENROLLED: "You are already enrolled in 2FA.",
    MFA_NOT_ENROLLED: "You are not enrolled in 2FA.",
    MFA_ENROL_SUCCESS: "Successfully enrolled!",
    MFA_ENROL_FAILURE: "Failed to enrol in 2FA. Please try again.",
    MFA_INVALID_CODE: "Invalid code.",
    MFA_REMOVE_SUCCESS: "Successfully removed 2FA."
}

module.exports = {
    STRINGS: STRINGS
}