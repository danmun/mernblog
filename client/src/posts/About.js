import React, { useState, useEffect } from "react";
import Post from "./Post";
import IconButton from "@material-ui/core/IconButton";
import AddPostIcon from "@material-ui/icons/AddCircle";
import Spinner from "../common/Spinner";
import PropTypes from "prop-types";
import { fetchAbout } from "../api/about";

const About = (props) => {
    const { post, onEdit, onCreate } = props;
    const [about, setAbout] = useState({
        loading: true,
        post: null,
    });

    // This will only fire when mounting, e.g. when navigated from About (1) externally (2) from another page.
    // In those cases, the passed post will be certainly null as the post is only passed when the PostManager closes
    // within the same page (e.g. after editing About content)
    useEffect(() => {
        fetchAbout().then((json) => {
            setAbout({
                loading: false,
                post: json.about,
            });
        });
    }, []);

    // the passed post enjoys priority over the fetched post, as it is more up-to-date (e.g. edited/created)
    // it must come first in the conditional assignment
    const postToShow = post || about.post;
    return (
        <React.Fragment>
            {about.loading ? <Spinner /> : showAbout(postToShow, onEdit)}
            {onCreate &&
                !about.loading &&
                !postToShow &&
                showCreateAbout(onCreate)}
        </React.Fragment>
    );
};

/**
 * Show button to create an About post.
 * @param onCreate
 * @returns {JSX.Element}
 */
const showCreateAbout = (onCreate) => {
    return (
        <div style={styles.admin.container}>
            <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={onCreate}
                style={styles.admin.icon}
            >
                <AddPostIcon />
            </IconButton>
        </div>
    );
};

const showAbout = (post, onEdit) => {
    if (!post) {
        return (
            <React.Fragment>
                <div style={styles.emptyAbout}>
                    {"Content for the 'About' page does not exist yet."}
                </div>
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
                <Post onEdit={onEdit} post={post} />
            </React.Fragment>
        );
    }
};

const styles = {
    emptyAbout: {
        textAlign: "center",
    },
    admin: {
        container: {
            textAlign: "center",
        },
        icon: {
            color: "green",
        },
    },
};

About.propTypes = {
    // a post is passed to About after editing or creating the about section
    // if no post is passed, it is fetched from the API
    post: PropTypes.object,
    // callback when edit icon is pressed - this only opens the PostManager,
    // the PostManager is then responsible for passing back the edited post to About via the post prop
    onEdit: PropTypes.func,
    onCreate: PropTypes.func,
};

export default About;
