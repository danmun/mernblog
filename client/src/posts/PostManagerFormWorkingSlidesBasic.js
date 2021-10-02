import "../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../style/editor.css";
import "date-fns";
import React from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { ContentState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import DateFnsUtils from "@date-io/date-fns";
import {
    TextField,
    Grid,
    Button,
    Hidden,
    Checkbox,
    FormControlLabel,
} from "@material-ui/core";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import SwipeableViews from "react-swipeable-views";
import SlideContainer from "../common/SlideContainer";
import { toggleCarousel } from "../utils";

const springConfig = {
    duration: "1s",
    easeFunction: "cubic-bezier(0.1, 0.35, 0.2, 1)",
    delay: "0.1s", // so that the `Read Post` button shows its animation
};

const initialSlideState = {
    slideIndex: 0,
    slideNavi: null,
    slideCount: 5,
};

// TODO: if full screen
//          display everything in one page without any slides with full editor functionality
//       if small
//          display slide version with reduced editor functionality

// TODO: onSubmit must compare old content with new content, if same, must not update page/feed/etc...
class PostManagerFormWorkingSlidesBasic extends React.Component {
    constructor(props) {
        super(props);

        let editingPostId = null;
        let editorState = null;
        let selectedDate = Date.now();
        let selectedDateChecked = false;
        let createAlbumChecked = false;
        let albumTitle = null;
        let title = "";
        let tags = "";

        if (props.editingPost != null) {
            editingPostId = props.editingPost._id;
            let content = htmlToDraft(props.editingPost.html);
            if (content) {
                editorState = EditorState.createWithContent(
                    ContentState.createFromBlockArray(content.contentBlocks)
                );
            }
            title = props.editingPost.title;
            tags = "#" + props.editingPost.tags.join("#");
        }

        this.state = {
            editingPostId: editingPostId,
            title: title, // textfield value
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
        this.handleCreateAlbumChecked = this.handleCreateAlbumChecked.bind(
            this
        );

        this.renderEditorSlide = this.renderEditorSlide.bind(this);
        this.renderExtrasSlide = this.renderExtrasSlide.bind(this);
        this.renderFullEditor = this.renderFullEditor.bind(this);
        this.renderSmallEditor = this.renderSmallEditor.bind(this);
        this.renderTitleSlide = this.renderTitleSlide.bind(this);
        this.renderTagsSlide = this.renderTagsSlide.bind(this);
        this.changeSlide = this.changeSlide.bind(this);
    }

    handleDateChange(date) {
        this.setState({ selectedDate: date });
    }

    handleDateChangeChecked(event) {
        let flag = event.target.checked;
        this.setState({ selectedDateChecked: flag });
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
        console.log("changeSlide()" + " " + this.state.slideState.slideIndex);
        let newSlideState = toggleCarousel(
            direction,
            this.state.slideState.slideIndex,
            this.state.slideState.slideCount
        );
        console.log(newSlideState.slideIndex);
        this.setState({ slideState: newSlideState });
    }

    renderSmallEditor() {
        console.log("renderSmallEditor()" + this.state.slideState.slideIndex);
        return (
            <React.Fragment>
                <SwipeableViews
                    disabled
                    springConfig={springConfig}
                    index={this.state.slideState.slideIndex}
                    style={{ maxWidth: "96vw" }}
                >
                    {this.renderTitleSlide()}
                    {this.renderEditorSlide()}
                    {this.renderTagsSlide()}
                    {this.renderExtrasSlide()}
                </SwipeableViews>
            </React.Fragment>
        );
    }

    renderTitleSlide() {
        return (
            <SlideContainer>
                <Grid item style={{ width: "100%" }}>
                    <TextField
                        style={{ width: "100%" }}
                        id="outlined-with-placeholder"
                        label="Title"
                        value={this.state.title}
                        placeholder="Keep it short and baity ..."
                        margin="normal"
                        variant="outlined"
                        inputProps={{ maxLength: "120" }}
                        onChange={this.titleOnType}
                    />
                </Grid>
                <Grid item style={{ width: "100%" }}>
                    <Button
                        onClick={() => this.changeSlide("next")}
                        variant="contained"
                        color="primary"
                        style={{ width: "100%" }}
                    >
                        Next
                    </Button>
                </Grid>
            </SlideContainer>
        );
    }

    renderTagsSlide() {
        return (
            <SlideContainer>
                <Grid item style={{ width: "100%" }}>
                    <TextField
                        style={{ width: "100%" }}
                        id="outlined-with-placeholder"
                        label="#tags"
                        value={this.state.tags}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ maxLength: "120" }}
                        onChange={this.hashtagOnType}
                        onBlur={this.hashtagOnBlur}
                        onFocus={this.hashtagOnFocus}
                    />
                </Grid>

                <Grid item style={{ width: "100%" }}>
                    <Button
                        onClick={() => this.changeSlide("prev")}
                        variant="contained"
                        color="primary"
                        style={{ width: "100%" }}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={() => this.changeSlide("next")}
                        variant="contained"
                        color="primary"
                        style={{ width: "100%" }}
                    >
                        Next
                    </Button>
                </Grid>
            </SlideContainer>
        );
    }

    renderEditorSlide() {
        let imageTool = {
            uploadCallback: this.props.uploadImageCallback,
            previewImage: true,
            alt: {
                present: true,
                mandatory: false,
            },
        };
        return (
            <SlideContainer>
                {/* this padding should match with padding in post/gallery (to avoid slider at bottom) */}
                <React.Fragment>
                    <Grid item style={{ width: "100%" }}>
                        <Hidden smUp implementation="js">
                            <Editor
                                editorClassName="wysiwyg-editor"
                                editorState={this.state.editorState}
                                onEditorStateChange={this.onEditorStateChange}
                                toolbar={{
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
                                    image: imageTool,
                                }}
                            />
                        </Hidden>
                        <Hidden xsDown implementation="js">
                            <Editor
                                editorClassName="wysiwyg-editor"
                                editorState={this.state.editorState}
                                onEditorStateChange={this.onEditorStateChange}
                                toolbar={{
                                    image: imageTool,
                                }}
                            />
                        </Hidden>
                    </Grid>

                    <Grid item style={{ width: "100%" }}>
                        <Button
                            onClick={() => this.changeSlide("prev")}
                            variant="contained"
                            color="primary"
                            style={{ width: "100%" }}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => this.changeSlide("next")}
                            variant="contained"
                            color="primary"
                            style={{ width: "100%" }}
                        >
                            Next
                        </Button>
                    </Grid>
                </React.Fragment>
            </SlideContainer>
        );
    }

    renderExtrasSlide() {
        return (
            <SlideContainer>
                <Grid item className={"hyphenate"} style={{ width: "100%" }}>
                    <div>
                        <div
                            style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                            }}
                        >
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <DateTimePicker
                                    margin="normal"
                                    id="date-picker-dialog"
                                    label="Post date"
                                    value={this.state.selectedDate}
                                    onChange={this.handleDateChange}
                                    disabled={!this.state.selectedDateChecked}
                                    KeyboardButtonProps={{
                                        "aria-label": "change date",
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </div>
                        <div
                            style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                                marginLeft: 20,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.state.selectedDateChecked}
                                        onChange={this.handleDateChangeChecked}
                                        value="checkedB"
                                        color="primary"
                                        inputProps={{
                                            "aria-label": "secondary checkbox",
                                        }}
                                    />
                                }
                                label="Change post date"
                            />
                        </div>
                        <div
                            style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                            }}
                        >
                            <TextField
                                style={{ width: "100%" }}
                                id="outlined-with-placeholder"
                                label="Album title"
                                value={this.state.albumTitle}
                                placeholder="A date or a few words"
                                margin="normal"
                                variant="outlined"
                                inputProps={{ maxLength: "120" }}
                                onChange={this.albumTitleOnType}
                                disabled={!this.state.createAlbumChecked}
                            />
                        </div>
                        <div
                            style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                                marginLeft: 20,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.state.createAlbumChecked}
                                        onChange={this.handleCreateAlbumChecked}
                                        value="checkedB"
                                        color="primary"
                                        inputProps={{
                                            "aria-label": "secondary checkbox",
                                        }}
                                    />
                                }
                                label="Create album"
                            />
                        </div>
                    </div>
                </Grid>
                <Grid item style={{ width: "100%" }}>
                    <Button
                        onClick={() => this.changeSlide("prev")}
                        variant="contained"
                        color="primary"
                        style={{ width: "100%" }}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={() => this.changeSlide("next")}
                        variant="contained"
                        color="primary"
                        style={{ width: "100%" }}
                    >
                        Submit
                    </Button>
                </Grid>
            </SlideContainer>
        );
    }

    renderFullEditor() {}

    render() {
        return this.renderSmallEditor();
    }

    // render(){
    //     let imageTool = {
    //         uploadCallback: this.props.uploadImageCallback,
    //         previewImage: true,
    //         alt: {
    //             present: true,
    //             mandatory: false
    //         }
    //     }
    //
    //     return(
    //         <React.Fragment>
    //             <Grid item style={{width: "100%"}}>
    //                 <TextField
    //                     style={{width: "100%"}}
    //                     id="outlined-with-placeholder"
    //                     label="Title"
    //                     value={this.state.title}
    //                     placeholder="Keep it short and baity ..."
    //                     margin="normal"
    //                     variant="outlined"
    //                     inputProps={{maxLength: "120"}}
    //                     onChange={this.titleOnType}
    //                 />
    //             </Grid>
    //
    //             <Grid item style={{width: "100%"}}>
    //                 <div>
    //                     <div style={{display: "inline-block", verticalAlign: "middle"}}>
    //                         <MuiPickersUtilsProvider utils={DateFnsUtils}>
    //                             <DateTimePicker
    //                                 margin="normal"
    //                                 id="date-picker-dialog"
    //                                 label="Post date"
    //                                 value={this.state.selectedDate}
    //                                 onChange={this.handleDateChange}
    //                                 disabled={!this.state.selectedDateChecked}
    //                                 KeyboardButtonProps={{
    //                                     'aria-label': 'change date',
    //                                 }}
    //                             />
    //                         </MuiPickersUtilsProvider>
    //                     </div>
    //                     <div style={{display: "inline-block", verticalAlign: "middle", marginLeft: 20}}>
    //                         <FormControlLabel
    //                             control={
    //                                 <Checkbox
    //                                     checked={this.state.selectedDateChecked}
    //                                     onChange={this.handleDateChangeChecked}
    //                                     value="checkedB"
    //                                     color="primary"
    //                                     inputProps={{
    //                                         'aria-label': 'secondary checkbox',
    //                                     }}
    //                                 />
    //                             }
    //                             label="Change post date"
    //                         />
    //                     </div>
    //                     <div style={{display: "inline-block", verticalAlign: "middle"}}>
    //                         <TextField
    //                             style={{width: "100%"}}
    //                             id="outlined-with-placeholder"
    //                             label="Album title"
    //                             value={this.state.albumTitle}
    //                             placeholder="A date or a few words"
    //                             margin="normal"
    //                             variant="outlined"
    //                             inputProps={{maxLength: "120"}}
    //                             onChange={this.albumTitleOnType}
    //                             disabled={!this.state.createAlbumChecked}
    //                         />
    //                     </div>
    //                     <div style={{display: "inline-block", verticalAlign: "middle", marginLeft: 20}}>
    //                         <FormControlLabel
    //                             control={
    //                                 <Checkbox
    //                                     checked={this.state.createAlbumChecked}
    //                                     onChange={this.handleCreateAlbumChecked}
    //                                     value="checkedB"
    //                                     color="primary"
    //                                     inputProps={{
    //                                         'aria-label': 'secondary checkbox',
    //                                     }}
    //                                 />
    //                             }
    //                             label="Create album"
    //                         />
    //                     </div>
    //                 </div>
    //             </Grid>
    //
    //             <Grid item style={{width: "100%"}}>
    //                 <Hidden smUp implementation="js">
    //                     <Editor
    //                         editorClassName="wysiwyg-editor"
    //                         editorState={this.state.editorState}
    //                         onEditorStateChange={this.onEditorStateChange}
    //                         toolbar={{
    //                             //options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'image', 'history'],
    //                             inline: { inDropdown: true },
    //                             list: { inDropdown: true },
    //                             textAlign: { inDropdown: true },
    //                             link: { inDropdown: true },
    //                             history: { inDropdown: true },
    //                             image: imageTool,
    //                         }}
    //                     />
    //                 </Hidden>
    //                 <Hidden xsDown implementation="js">
    //                     <Editor
    //                         editorClassName="wysiwyg-editor"
    //                         editorState={this.state.editorState}
    //                         onEditorStateChange={this.onEditorStateChange}
    //                         toolbar={{
    //                             image: imageTool,
    //                         }}
    //                     />
    //                 </Hidden>
    //             </Grid>
    //
    //             <Grid item style={{width: "100%"}}>
    //                 <TextField
    //                     style={{width: "100%"}}
    //                     id="outlined-with-placeholder"
    //                     label="#tags"
    //                     value={this.state.tags}
    //                     margin="normal"
    //                     variant="outlined"
    //                     inputProps={{maxLength: "120"}}
    //                     onChange={this.hashtagOnType}
    //                     onBlur={this.hashtagOnBlur}
    //                     onFocus={this.hashtagOnFocus}
    //                 />
    //             </Grid>
    //
    //             <Grid item style={{width: "100%"}}>
    //                 <Button onClick={() => this.props.onSubmit(this.state)} variant="contained" color="primary" style={{width: "100%"}}>
    //                     Post
    //                     <Icon>send</Icon>
    //                 </Button>
    //             </Grid>
    //         </React.Fragment>
    //     );
    // }
}
export default PostManagerFormWorkingSlidesBasic;
