import "../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../style/editor.css";
import "date-fns";
import React from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import DateFnsUtils from "@date-io/date-fns";
import { withStyles } from "@material-ui/core/styles";
import {
    TextField,
    Grid,
    Icon,
    Hidden,
    Checkbox,
    FormControlLabel,
} from "@material-ui/core";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import SwipeableViews from "react-swipeable-views";
import SlideContainer from "../common/SlideContainer";
import { toggleCarousel } from "../utils";
import HorizontalStepper from "../common/HorizontalStepper";
import PropTypes from "prop-types";
import CircularProgressButton from "../common/CircularProgressButton";

const springConfig = {
    duration: "1s",
    easeFunction: "cubic-bezier(0.1, 0.35, 0.2, 1)",
    delay: "0.1s", // so that the `Read Post` button shows its animation
};

const initialSlideState = {
    slideIndex: 0,
    slideNavi: null,
    slideCount: 4,
};

// currently two problems:
// TODO: image upload popup messes its position up on upload
// TODO: modal too wide for iphone 5S
//       for modal: style={{display:'flex', alignItems:'center', justifyContent:'center', margin: "auto"}}
//       in editor.css if(mobile height < 600): .wysiwyg-editor -> min-height: 30vh;and max-height: 30vh;
//       else 50vh

// TODO: if full screen
//          display everything in one page without any slides with full editor functionality
//       if small
//          display slide version with reduced editor functionality
// TODO: separate out into MobileEditor/FullSizeEditor components
// TODO: clean up state and slide control logic

// NOTE: we could go back to materialui modal i guess...
//  since we can now have a responsive solution (slides) regardless of modal type...

// TODO: onSubmit must compare old content with new content, if same, must not update page/feed/etc...
class PostManagerForm extends React.Component {
    constructor(props) {
        super(props);

        let postId = null;
        let editorState = null;
        let selectedDate = Date.now();
        let selectedDateChecked = false;
        let createAlbumChecked = false;
        let displayEditDateChecked = false;
        let albumTitle = null;
        let title = "";
        let tags = "";

        if (props.post != null) {
            postId = props.post._id;
            displayEditDateChecked = props.post.displayEditDate;
            let content = htmlToDraft(props.post.html);
            if (content) {
                editorState = EditorState.createWithContent(
                    ContentState.createFromBlockArray(content.contentBlocks)
                );
            }
            title = props.post.title;
            tags = "#" + props.post.tags.join("#");
        }

        this.state = {
            postId: postId,
            title: title, // textfield value
            displayEditDateChecked: displayEditDateChecked,
            selectedDate: selectedDate,
            selectedDateChecked: selectedDateChecked,
            createAlbumChecked: createAlbumChecked,
            albumTitle: albumTitle,
            tags: tags, // textfield value
            editorState: editorState, // contentState -> convert this to Markdown or HTML for saving to DB
            slideState: initialSlideState,
        };

        this.hashtagOnBlur = this.hashtagOnBlur.bind(this);
        this.hashtagOnFocus = this.hashtagOnFocus.bind(this);
        this.hashtagOnType = this.hashtagOnType.bind(this);
        this.titleOnType = this.titleOnType.bind(this);
        this.albumTitleOnType = this.albumTitleOnType.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleDateChangeChecked = this.handleDateChangeChecked.bind(this);
        this.handleShowDisplayEditDate = this.handleShowDisplayEditDate.bind(
            this
        );
        this.handleCreateAlbumChecked = this.handleCreateAlbumChecked.bind(
            this
        );

        this.changeSlide = this.changeSlide.bind(this);

        this.titleComponent = this.titleComponent.bind(this);
        this.editorComponent = this.editorComponent.bind(this);
        this.editorToolbarProps = this.editorToolbarProps.bind(this);
        this.tagsComponent = this.tagsComponent.bind(this);
        this.extrasComponent = this.extrasComponent.bind(this);
        this.editModeButtons = this.editModeButtons.bind(this);
        this.postModeButtons = this.postModeButtons.bind(this);
        this.submitButton = this.submitButton.bind(this);

        this.renderStandard = this.renderStandard.bind(this);
        this.renderResponsive = this.renderResponsive.bind(this);

        this.doSubmit = this.doSubmit.bind(this);
    }

    handleDateChange(date) {
        this.setState({ selectedDate: date });
    }

    handleDateChangeChecked(event) {
        let flag = event.target.checked;
        this.setState({ selectedDateChecked: flag });
    }

    handleShowDisplayEditDate(event) {
        let flag = event.target.checked;
        this.setState({ displayEditDateChecked: flag });
    }

    handleCreateAlbumChecked(event) {
        let flag = event.target.checked;
        this.setState({ createAlbumChecked: flag });
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

    onEditorStateChange(editorState) {
        this.setState({
            editorState,
        });
    }

    titleOnType(event) {
        let text = event.target.value;
        this.setState({ title: text });
    }

    albumTitleOnType(event) {
        let text = event.target.value;
        this.setState({ albumTitle: text });
    }

    changeSlide(direction) {
        let newSlideState = toggleCarousel(
            direction,
            this.state.slideState.slideIndex,
            this.state.slideState.slideCount
        );
        this.setState({ slideState: newSlideState });
    }

    titleComponent() {
        return (
            <TextField
                style={styles.main.title.self}
                id="outlined-with-placeholder"
                label="Title"
                value={this.state.title}
                placeholder="Keep it short and baity ..."
                margin="normal"
                variant="outlined"
                inputProps={styles.main.title.inputProps}
                onChange={this.titleOnType}
            />
        );
    }

    editorToolbarProps(imgTool) {
        return {
            options: [
                "inline",
                "blockType",
                "fontSize",
                "fontFamily",
                "list",
                "textAlign",
                "colorPicker",
                "link",
                "image",
                "history",
            ],
            inline: { inDropdown: true },
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
            link: { inDropdown: true },
            history: { inDropdown: true },
            image: imgTool,
        };
    }

    editorComponent(classes) {
        let imageTool = {
            popupClassName: classes.imagePopup,
            uploadCallback: this.props.uploadImageCallback,
            previewImage: true,
            alt: {
                present: true,
                mandatory: false,
            },
        };
        return (
            <Editor
                editorClassName={classes.editor}
                // toolbarClassName="wysiwyg-toolbar"
                editorState={this.state.editorState}
                onEditorStateChange={this.onEditorStateChange}
                toolbar={this.editorToolbarProps(imageTool)}
            />
        );
    }

    tagsComponent() {
        return (
            <TextField
                style={styles.main.tags.self}
                id="outlined-with-placeholder"
                label="#tags"
                value={this.state.tags}
                margin="normal"
                variant="outlined"
                inputProps={styles.main.tags.inputProps}
                onChange={this.hashtagOnType}
                onBlur={this.hashtagOnBlur}
                onFocus={this.hashtagOnFocus}
            />
        );
    }

    extrasComponent() {
        return (
            <div>
                <div style={styles.extras.date.picker.container}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DateTimePicker
                            margin="normal"
                            id="date-picker-dialog"
                            label="Post date"
                            value={this.state.selectedDate}
                            onChange={this.handleDateChange}
                            disabled={!this.state.selectedDateChecked}
                            KeyboardButtonProps={
                                styles.extras.date.picker.keyboardButtonProps
                            }
                        />
                    </MuiPickersUtilsProvider>
                </div>
                <div style={styles.extras.date.checkbox.container}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.selectedDateChecked}
                                onChange={this.handleDateChangeChecked}
                                value="checkedB"
                                color="primary"
                                inputProps={
                                    styles.extras.date.checkbox.inputProps
                                }
                            />
                        }
                        label="Change post date"
                    />
                </div>
                <div style={styles.extras.album.title.container}>
                    <TextField
                        style={styles.extras.album.title.inputField.self}
                        id="outlined-with-placeholder"
                        label="Album title"
                        value={this.state.albumTitle}
                        placeholder="A date or a few words"
                        margin="normal"
                        variant="outlined"
                        inputProps={
                            styles.extras.album.title.inputField.inputProps
                        }
                        onChange={this.albumTitleOnType}
                        disabled={!this.state.createAlbumChecked}
                    />
                </div>
                <div style={styles.extras.album.checkbox.container}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.createAlbumChecked}
                                onChange={this.handleCreateAlbumChecked}
                                value="checkedB"
                                color="primary"
                                inputProps={
                                    styles.extras.album.checkbox.inputProps
                                }
                            />
                        }
                        label="Create album"
                    />
                </div>
                {this.props.post && (
                    <div style={styles.extras.editDisplay.container}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.displayEditDateChecked}
                                    onChange={this.handleShowDisplayEditDate}
                                    value="checked"
                                    color="primary"
                                    inputProps={
                                        styles.extras.editDisplay.inputProps
                                    }
                                />
                            }
                            label="Display edit date on post page"
                        />
                    </div>
                )}
            </div>
        );
    }

    submitButton(text, variant, onClick) {
        return (
            <CircularProgressButton
                loading={this.props.isSubmitting}
                onClick={onClick}
                variant={variant}
                color={"primary"}
            >
                {text}
                <Icon>send</Icon>
            </CircularProgressButton>
        );
    }

    doSubmit(isDraft) {
        this.props.onSubmit(this.state, isDraft);
    }

    postModeButtons(isResponsive) {
        const { classes } = this.props;
        return (
            <ButtonContainer responsive={isResponsive} classes={classes}>
                {this.submitButton("Publish", "contained", () =>
                    this.doSubmit(false)
                )}
                {this.submitButton("Draft", "outlined", () =>
                    this.doSubmit(true)
                )}
            </ButtonContainer>
        );
    }

    editModeButtons(isResponsive) {
        const { classes, post } = this.props;
        // if publishedAt exists, post is not a draft
        if (post.publishedAt) {
            return (
                <ButtonContainer responsive={isResponsive} classes={classes}>
                    {this.submitButton("Save", "contained", () =>
                        this.doSubmit(false)
                    )}
                </ButtonContainer>
            );
        } else {
            // post is a draft
            return (
                <ButtonContainer responsive={isResponsive} classes={classes}>
                    {this.submitButton("Publish", "contained", () =>
                        this.doSubmit(false)
                    )}
                    {this.submitButton("Save", "outlined", () =>
                        this.doSubmit(true)
                    )}
                </ButtonContainer>
            );
        }
    }

    renderResponsive() {
        const editMode = this.props.post !== null;
        const classes = {
            imagePopup: "wysiwyg-editor-image-popup-responsive",
            editor: "wysiwyg-editor-responsive",
        };

        return (
            <div>
                <div>
                    {/* TODO: uhm.. why is this wrapped in SwipeableViews? What relation does it have to swiping? */}
                    <SwipeableViews
                        disabled
                        springConfig={springConfig}
                        index={this.state.slideState.slideIndex}
                        style={styles.responsive.container}
                    >
                        <SlideContainer>
                            <Grid item style={styles.responsive.title}>
                                {this.titleComponent()}
                            </Grid>
                        </SlideContainer>

                        <SlideContainer>
                            <Grid item style={styles.responsive.editor}>
                                {this.editorComponent(classes)}
                            </Grid>
                        </SlideContainer>

                        <SlideContainer>
                            <Grid item style={styles.responsive.tags}>
                                {this.tagsComponent()}
                            </Grid>

                            <Grid item style={styles.responsive.extras}>
                                {this.extrasComponent()}
                            </Grid>
                        </SlideContainer>
                    </SwipeableViews>
                </div>

                <div style={styles.responsive.stepper}>
                    <HorizontalStepper
                        steps={["Title", "Content", "Options"]}
                        onBack={() => this.changeSlide("prev")}
                        onNext={() => this.changeSlide("next")}
                    >
                        {editMode
                            ? this.editModeButtons(true)
                            : this.postModeButtons(true)}
                    </HorizontalStepper>
                </div>
            </div>
        );
    }

    renderStandard() {
        const editMode = this.props.post !== null;
        const classes = {
            imagePopup: "wysiwyg-editor-image-popup",
            editor: "wysiwyg-editor",
        };

        return (
            <React.Fragment>
                <Grid item style={styles.nonResponsive.containers}>
                    {this.titleComponent()}
                </Grid>

                <Grid item style={styles.nonResponsive.containers}>
                    {this.extrasComponent()}
                </Grid>

                <Grid item style={styles.nonResponsive.containers}>
                    {this.editorComponent(classes)}
                </Grid>

                <Grid item style={styles.nonResponsive.containers}>
                    {this.tagsComponent()}
                </Grid>

                <Grid item style={styles.nonResponsive.containers}>
                    {editMode
                        ? this.editModeButtons(false)
                        : this.postModeButtons(false)}
                </Grid>
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Hidden smUp implementation="js">
                    {this.renderResponsive()}
                </Hidden>
                <Hidden xsDown implementation="js">
                    {this.renderStandard()}
                </Hidden>
            </React.Fragment>
        );
    }
}

const ButtonContainer = (props) => {
    const { children, classes, responsive } = props;
    const patchedChildren = Array.isArray(children) ? children : [children];
    const numChildren = patchedChildren.length;
    return (
        <div style={styles.buttonContainer.container}>
            {patchedChildren.map((child, index) => {
                let className = "";
                if (index === 0) {
                    className = classes.rightGap;
                } else if (index === numChildren - 1) {
                    // this is kind of bad as it relies on styling (spacing) of in HorizontalStepper's Back button
                    if (!responsive) className = classes.leftGap;
                }
                return (
                    <div
                        key={`btnContainer${responsive ? "R" : "NR"}${index}`}
                        style={styles.buttonContainer.item}
                        className={className}
                    >
                        {child}
                    </div>
                );
            })}
        </div>
    );
};

const useStyle = (theme) => ({
    rightGap: {
        marginRight: theme.spacing(1),
    },
    leftGap: {
        marginLeft: theme.spacing(1),
    },
});

const styles = {
    buttonContainer: {
        container: {
            display: "flex",
        },
        item: {
            width: "100%",
        },
    },
    responsive: {
        container: {
            maxWidth: "96vw",
        },
        title: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        editor: {
            width: "100%",
            overflow: "visible",
        },
        tags: {
            width: "100%",
        },
        extras: {
            width: "100%",
            textAlign: "center",
        },
        stepper: {
            width: "100%",
            textAlign: "center",
        },
    },
    nonResponsive: {
        containers: {
            width: "100%",
        },
    },
    main: {
        title: {
            self: {
                width: "100%",
            },
            inputProps: {
                maxLength: "120",
            },
        },
        tags: {
            self: {
                width: "100%",
            },
            inputProps: {
                maxLength: "120",
            },
        },
    },
    extras: {
        date: {
            picker: {
                container: {
                    display: "inline-block",
                    verticalAlign: "middle",
                },
                keyboardButtonProps: {
                    "aria-label": "change date",
                },
            },
            checkbox: {
                container: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginLeft: 20,
                },
                inputProps: {
                    "aria-label": "secondary checkbox",
                },
            },
        },
        album: {
            title: {
                container: {
                    display: "inline-block",
                    verticalAlign: "middle",
                },
                inputField: {
                    self: {
                        width: "100%",
                    },
                    inputProps: {
                        maxLength: "120",
                    },
                },
            },
            checkbox: {
                container: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginLeft: 20,
                },
                inputProps: {
                    "aria-label": "secondary checkbox",
                },
            },
        },
        editDisplay: {
            container: {
                display: "inline-block",
                verticalAlign: "middle",
                marginLeft: 20,
            },
            inputProps: {
                "aria-label": "secondary checkbox",
            },
        },
    },
};

ButtonContainer.propTypes = {
    responsive: PropTypes.bool,
};

PostManagerForm.propTypes = {
    onSubmit: PropTypes.func,
    post: PropTypes.object,
    uploadImageCallback: PropTypes.func,
    isSubmitting: PropTypes.bool,
};

export default withStyles(useStyle)(PostManagerForm);
