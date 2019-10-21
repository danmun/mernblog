const STRINGS = {
    REGISTER_SUCCESS: "Successfully registered!",
    LOGOUT_FAILURE: "You are not logged in so please don't try to log out.",
    LOGIN_FAILURE : "Incorrect username or password.",
    LOGIN_SUCCESS: "Successfully logged in!",

    NEWPOST_SUCCESS: "Successfully posted to the feed!",
    NEWPOST_AUTH_FAILURE: "You must log in to submit new posts.",

    EDITPOST_FAILURE: "Something has gone wrong while editing the post.",
    EDITPOST_SUCCESS: "Successfully edited post!",
    EDITPOST_AUTH_FAILURE: "You must log in to edit posts.",

    DELETEPOST_SUCCESS: "Post successfully deleted!",
    DELETEPOST_AUTH_FAILURE: "You must log in to delete posts.",

    NEWABOUT_AUTH_FAILURE: "You must log in to create the About section.",

    EDITABOUT_AUTH_FAILURE: "You must log in to edit the About section.",
    EDITABOUT_FAILURE: "Something has gone wrong while editing the About page.",

    SERVER_ERROR: 'Server error. Please try again later.'
}

module.exports = {
    STRINGS: STRINGS
}