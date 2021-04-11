import React from "react";
import { convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import PostManagerForm from "./PostManagerForm";
import { getImgurClientId } from "./api/auth";
import PropTypes from 'prop-types';

// TODO: rename to PostEditor and PostEditorForm
class PostManager extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.uploadImageCallback = this.uploadImageCallback.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.getPhotosFromRawContent = this.getPhotosFromRawContent.bind(this);
    }

    // TODO/FIXME: if post edited from post view, then return to feed, the feed still shows the old version of the post
    // TODO: onSubmit, if edited content same as before, don't submit, just exit the modal
    handleSubmit(form) {
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

        // if post date is not modified, post creation date should be the time when
        // the user presses the submit button not when they start creating the post
        if (!selectedDateChecked) {
            selectedDate = Date.now();
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
            if (createAlbumChecked) {
                album.hidden = false;
            } else {
                album.hidden = true; // default in db
            }
        }

        // all three fields must contain data, we have already checked for the html field earler
        // TODO: change this mechanic to disable post-button while any data missing
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

        if (post.id === null || post.id.trim().length === 0) {
            this.props.onCreate(post)
        } else {
            this.props.onEdit(post)
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

    render() {
        // unfortunately the image tool of the editor library uses the link of the image to display it in the little image
        // box during editing... even if we choose the file option instead of the link option, it will wait for the file
        // to be uploaded (by uploadImageCallback) then take the link from the Imgur API response to display the image
        return (
            <PostManagerForm
                onSubmit={this.handleSubmit}
                uploadImageCallback={this.uploadImageCallback}
                post={this.props.post}
            />
        );
    }
}

PostManager.propTypes = {
    onCreate: PropTypes.func,
    onEdit: PropTypes.func,
    post: PropTypes.object
}

export default PostManager;
