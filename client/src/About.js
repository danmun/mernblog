import React, { useState, useEffect } from "react";
import Post from "./Post";
import PostManager from "./PostManager";
import AdminModal from "./AdminModal";
import IconButton from "@material-ui/core/IconButton";
import AddPostIcon from "@material-ui/icons/AddCircle";
import Spinner from "./Spinner";
import { editAbout, fetchAbout, createAbout } from "./api/about";

const modalInitialState = {
    open: false,
    title: "Add an About section",
    editingPost: null,
}

function About(props) {
    let isAdmin = props.isAdmin;

    const [modal, setModal] = useState(modalInitialState);

    const [about, setAbout] = useState({
        loading: true,
        post: null,
    });

    useEffect(() => {
        fetchAbout().then((json) => {
            setAbout({
                loading: false,
                post: json.about,
            });
        });
    }, []);

    const submitCreateAbout = (post) => {
        createAbout(post).then((json) => {
            setAbout({ post: json.about });
            setModal(modalInitialState);
        });
    }

    const submitEditAbout = (post) => {
        editAbout(post).then((json) => {
            setAbout({ post: json.about });
            setModal(modalInitialState);
        });
    }

    return (
        <React.Fragment>
            {about.loading ? <Spinner/> : showAbout(isAdmin, about, modal, setModal)}

            {(isAdmin && !about.loading && !about.post) && showAdminUI(about, modal, setModal)}

            <div>
                <AdminModal
                    title={modal.title}
                    open={modal.open}
                    dispose={() => setModal({ open: false })}
                >
                     {/*TODO: issue: outdated usage of PostManager -- under construction*/}
                    <PostManager
                        onCreate={submitCreateAbout}
                        onEdit={submitEditAbout}
                        post={modal.editingPost}
                    />
                </AdminModal>
            </div>
        </React.Fragment>
    );
}

function showAdminUI(about, modal, setModal) {
    return (
        <div style={styles.admin.container}>
            <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={() => openPostManager(about, modal, setModal)}
                style={styles.admin.icon}
            >
                <AddPostIcon />
            </IconButton>
        </div>
    );
}

function showAbout(isAdmin, about, modal, setModal) {
    if (!about.post) {
        return (
            <React.Fragment>
                <div style={styles.emptyAbout}>
                    {"Content for the 'About' page does not exist yet."}
                </div>
            </React.Fragment>
        );
    } else {
        let onEdit = isAdmin ? () => openPostManager(about, modal, setModal) : null;
        return (
            <React.Fragment>
                <Post onEdit={onEdit} post={about.post} />
            </React.Fragment>
        );
    }
}

function openPostManager(about, modal, setModal) {
    setModal({
        ...modal,
        editingPost: about.post,
        open: true,
    });
}

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

export default About;
