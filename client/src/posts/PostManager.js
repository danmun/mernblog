import React from "react";
import { convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import PostManagerForm from "./PostManagerForm";
import { getImgurClientId } from "../api/auth";
import PropTypes from "prop-types";
import { createPost, editPost } from "../api/posts";
import { createAbout, editAbout } from "../api/about";

// TODO: rename to PostEditor and PostEditorForm
class PostManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSubmitting: false,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.uploadImageCallback = this.uploadImageCallback.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.getPhotosFromRawContent = this.getPhotosFromRawContent.bind(this);

        this.submitCreatePost = this.submitCreatePost.bind(this);
        this.submitEditPost = this.submitEditPost.bind(this);
    }

    // TODO/FIXME: if post edited from post view, then return to feed, the feed still shows the old version of the post
    // TODO: onSubmit, if edited content same as before, don't submit, just exit the modal
    handleSubmit(form, isDraft) {
        let {
            editorState,
            postId,
            title,
            albumTitle,
            createAlbumChecked,
            displayEditDateChecked,
            selectedDate,
            selectedDateChecked,
            tags,
        } = form;

        // if everything untouched, do nothing
        if (!editorState) return;

        // if editor has changed, extract HTML
        let editorContent = editorState.getCurrentContent();
        let rawContent = convertToRaw(editorContent);

        let html = draftToHtml(rawContent);
        let plaintext = null;

        // if editor content is empty do nothing, in the future, inform user to fill out all fields
        if (html != null && html.trim() === "<p></p>") {
            return; // html/text must exist
        } else {
            // if editor not empty, get the plaintext of the content
            // note: using positional access in this case is bad practise as it is more prone to bugs
            //  e.g. if draftjs api changes
            plaintext = rawContent.blocks[0].text;
        }

        // post date will be set by backend unless customized by user
        if (!selectedDateChecked) {
            selectedDate = null;
        }

        let photos = this.getPhotosFromRawContent(rawContent);
        let album = null;

        if (photos.length > 0) {
            album = {
                title: albumTitle,
                photos: photos,
            };

            // if checked, the album will be immediately visible in Gallery page
            // otherwise admin will have to set it visible (unhidden) on gallery page using edit gallery
            // TODO:CLEANUP simplify to album.hidden = !createAlbumChecked
            //              but idealy, either
            //                  - rename createAlbumChecked or refactor logic in PostManagerForm to directly match
            //                    the logic of the field in the database model (album.hidden)
            //                    e.g. createHiddenAlbum instead of createAlbum checked => album.hidden = createHiddenAlbum
            //                    OR
            //                  - rename the field on the db model to match the form input,
            //                    e.g. album.public instead of album.hidden => album.public = createAlbumChecked
            if (createAlbumChecked) {
                album.hidden = false;
            } else {
                album.hidden = true; // default in db
            }
        }

        // all three fields must contain data, we have already checked for the html field earler
        // TODO:CLEANUP change this mechanic to disable post-button while any data missing
        if (!tags || !title) {
            return;
        }

        let post = {
            id: postId,
            html: html,
            plaintext: plaintext,
            title: title,
            album: album,
            date: selectedDate,
            displayEditDate: displayEditDateChecked,
            tags: tags.split("#").filter((item) => item), // split string of tags into hashtagless array
        };

        this.setState({ isSubmitting: true });
        const { isAbout } = this.props;
        if (post.id === null || post.id.trim().length === 0) {
            isAbout
                ? this.submitCreateAbout(post, isDraft)
                : this.submitCreatePost(post, isDraft);
        } else {
            isAbout
                ? this.submitEditAbout(post, isDraft)
                : this.submitEditPost(post, isDraft);
        }
    }

    getPhotosFromRawContent(rawContent) {
        let photos = [];
        let entityMap = rawContent.entityMap; // NOTE: this is NOT actually a map... it's plain JSON

        for (let key in entityMap) {
            let entity = entityMap[key];
            // NOTE: using for..in, order of items not guaranteed to be in original order of insertion
            if (!entityMap.hasOwnProperty(key)) {
                //The current property is not a direct property of p
                continue;
            }

            if (!entity) {
                continue;
            }

            let type = entity.type;
            let data = entity.data;
            if (type && data) {
                if (type.toLowerCase() === "image") {
                    photos.push(data.src);
                }
            }
        }
        return photos;
    }

    // TODO: query imgur client id while logged in, then do upload image
    /**
     * Upload image to server
     * @param file the file to upload
     * @returns {Promise<any>}
     */
    async uploadImageCallback(file) {
        let clientId = await getImgurClientId();
        return this.uploadImage(clientId, file);
    }

    // this might return 429 on localhost, imgur no longer allows uploads from localhost
    // https://stackoverflow.com/a/66715914
    uploadImage(imgurClientId, file) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "https://api.imgur.com/3/image");
            xhr.setRequestHeader("Authorization", "Client-ID " + imgurClientId);
            const data = new FormData();
            data.append("image", file);
            xhr.send(data);
            xhr.addEventListener("load", () => {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            });
            xhr.addEventListener("error", () => {
                const error = JSON.parse(xhr.responseText);
                reject(error);
            });
        });
    }

    submitCreatePost(post, isDraft) {
        createPost(post, isDraft).then((json) => {
            this.setState({ isSubmitting: false });
            this.props.onCreated(json.post);
        });
    }

    submitEditPost(post, isDraft) {
        editPost(post, isDraft).then((json) => {
            this.setState({ isSubmitting: false });
            this.props.onEdited(json.post);
        });
    }

    submitCreateAbout(post, isDraft) {
        createAbout(post, isDraft).then((json) => {
            this.setState({ isSubmitting: false });
            this.props.onCreated(json.about);
        });
    }

    submitEditAbout(post, isDraft) {
        editAbout(post, isDraft).then((json) => {
            this.setState({ isSubmitting: false });
            this.props.onEdited(json.about);
        });
    }

    render() {
        // unfortunately the image tool of the editor library uses the link of the image to display it in the little image
        // box during editing... even if we choose the file option instead of the link option, it will wait for the file
        // to be uploaded (by uploadImageCallback) then take the link from the Imgur API response to display the image
        return (
            <PostManagerForm
                onSubmit={this.handleSubmit}
                uploadImageCallback={this.uploadImageCallback}
                post={this.props.post}
                isSubmitting={this.state.isSubmitting}
            />
        );
    }
}

PostManager.propTypes = {
    onCreated: PropTypes.func,
    onEdited: PropTypes.func,
    post: PropTypes.object,
    isAbout: PropTypes.bool,
};

export default PostManager;
