import "../style/editor.css";
import React from "react";
import Grid from "@material-ui/core/Grid";
import { TextField } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import PropTypes from "prop-types";
import CircularProgressButton from "../common/CircularProgressButton";

class CreateAlbum extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "", // textfield value
            tags: "", // textfield value
            description: "",
            images: [],
            isSubmitting: false,
        };

        this.hashtagOnBlur = this.hashtagOnBlur.bind(this);
        this.hashtagOnFocus = this.hashtagOnFocus.bind(this);
        this.hashtagOnType = this.hashtagOnType.bind(this);
        this.titleOnType = this.titleOnType.bind(this);
        this.descriptionOnType = this.descriptionOnType.bind(this);
        this.handleFileSelection = this.handleFileSelection.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    hashtagOnType(event) {
        let text = event.target.value;
        let currentChar = text[text.length - 1];
        let previousNonSpaceChar = text[text.length - 2];

        // if initial hashtag is deleted, field will be empty, append new initial hashtag if user starts typing
        if (this.state.tags === "") {
            this.setState({ tags: "#" + text });
        } else if (currentChar === " " && previousNonSpaceChar === "#") {
            return;
        } else if (text === " ") {
            this.setState({ tags: "#" });
        } else if (text.endsWith(" ")) {
            this.setState({ tags: text + "#" });
        } else {
            this.setState({ tags: text });
        }
    }

    hashtagOnBlur(event) {
        let text = event.target.value;
        if (text.endsWith("#")) {
            let newText = text.substr(0, text.length - 1).trim();
            this.setState({ tags: newText });
        }
    }

    hashtagOnFocus(event) {
        if (!this.state.tags.endsWith(" #")) {
            let tag = "#";
            if (this.state.tags.length === 0) {
                this.setState({ tags: tag });
            } else {
                this.setState({ tags: this.state.tags + " #" });
            }
        }
    }

    handleFileSelection(files) {
        this.setState({ images: files });
    }

    handleSubmit() {
        this.setState({ isSubmitting: true });
        // do API call here, then do:
        // this.setState({isSubmitting: false});
        // TODO:CLEANUP fix album creation, do api call from here, implement the rest ... etc...
        this.props.onCreate(this.state);
    }

    titleOnType(event) {
        let text = event.target.value;
        this.setState({ title: text });
    }

    descriptionOnType(event) {
        let text = event.target.value;
        this.setState({ description: text });
    }

    render() {
        let { title, description, tags } = this.state;
        return (
            <React.Fragment>
                <Grid item style={styles.title.container}>
                    <TextField
                        style={styles.title.inputField}
                        id="outlined-with-placeholder"
                        label="Title"
                        value={title}
                        placeholder="Keep it short and catchy ..."
                        margin="normal"
                        variant="outlined"
                        inputProps={styles.title.inputProps}
                        onChange={this.titleOnType}
                    />
                </Grid>

                <Grid item style={styles.description.container}>
                    <TextField
                        style={styles.description.inputField}
                        id="outlined-with-placeholder"
                        label="Description"
                        value={description}
                        placeholder="A few words about it ..."
                        margin="normal"
                        variant="outlined"
                        inputProps={styles.description.inputProps}
                        onChange={this.descriptionOnType}
                    />
                </Grid>

                <Grid item style={styles.filesSelection.container}>
                    <div style={styles.filesSelection.inputField}>
                        <input
                            onChange={(event) =>
                                this.handleFileSelection(event.target.files)
                            }
                            type={"file"}
                            name="album"
                            multiple
                        />
                    </div>
                </Grid>

                <Grid item style={styles.hashtags.container}>
                    <TextField
                        style={styles.hashtags.inputField}
                        id="outlined-with-placeholder"
                        label="#tags"
                        value={tags}
                        margin="normal"
                        variant="outlined"
                        inputProps={styles.hashtags.inputProps}
                        onChange={this.hashtagOnType}
                        onBlur={this.hashtagOnBlur}
                        onFocus={this.hashtagOnFocus}
                    />
                </Grid>

                <Grid item style={styles.submit.container}>
                    <CircularProgressButton
                        loading={this.state.isSubmitting}
                        onClick={this.handleSubmit}
                        variant="contained"
                        color="primary"
                    >
                        Create
                        <Icon>send</Icon>
                    </CircularProgressButton>
                </Grid>
            </React.Fragment>
        );
    }
}

const styles = {
    title: {
        container: {
            width: "100%",
        },
        inputField: {
            width: "100%",
        },
        inputProps: {
            maxLength: "120",
        },
    },
    description: {
        container: {
            width: "100%",
        },
        inputField: {
            width: "100%",
        },
        inputProps: {
            maxLength: "300",
        },
    },
    filesSelection: {
        container: {
            width: "100%",
            textAlign: "center",
            border: "1px solid lightgrey",
        },
        inputField: {
            padding: "20px",
        },
    },
    hashtags: {
        container: {
            width: "100%",
        },
        inputField: {
            width: "100%",
        },
        inputProps: {
            maxLength: "120",
        },
    },
    submit: {
        container: {
            width: "100%",
        },
        button: {
            width: "100%",
        },
    },
};

CreateAlbum.propTypes = {
    onCreate: PropTypes.func,
};

export default CreateAlbum;
