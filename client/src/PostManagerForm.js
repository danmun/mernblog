import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './style/editor.css'
import 'date-fns'
import React from 'react';
import {Editor} from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import { ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import DateFnsUtils from '@date-io/date-fns';
import { TextField, Grid, Button, Icon, Hidden, Checkbox, FormControlLabel} from "@material-ui/core";
import {MuiPickersUtilsProvider, DateTimePicker} from '@material-ui/pickers'
import SwipeableViews from "react-swipeable-views";
import SlideContainer from "./SlideContainer";
import {toggleCarousel} from "./utils";
import HorizontalStepper from "./HorizontalStepper";

const springConfig = {
    duration: "1s",
    easeFunction: "cubic-bezier(0.1, 0.35, 0.2, 1)",
    delay: "0.1s", // so that the `Read Post` button shows its animation
}

const initialSlideState = {
    slideIndex: 0,
    slideNavi: null,
    slideCount: 4,
}

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

    constructor(props){
        super(props);

        let postId = null
        let editorState = null
        let selectedDate = Date.now()
        let selectedDateChecked = false
        let createAlbumChecked = false
        let displayEditDateChecked = false
        let showDisplayEditDate = false
        let albumTitle = null
        let title = ""
        let tags = ""

        if(props.post != null){
            showDisplayEditDate = true
            postId = props.post._id
            displayEditDateChecked = props.post.displayEditDate
            let content = htmlToDraft(props.post.html)
            if(content){
                editorState = EditorState.createWithContent(ContentState.createFromBlockArray(content.contentBlocks))
            }
            title = props.post.title
            tags = "#" + props.post.tags.join("#")
        }

        this.state = {
            postId: postId,
            title: title, // textfield value
            showDisplayEditDate: showDisplayEditDate,
            displayEditDateChecked: displayEditDateChecked,
            selectedDate: selectedDate,
            selectedDateChecked: selectedDateChecked,
            createAlbumChecked: createAlbumChecked,
            albumTitle: albumTitle,
            tags: tags, // textfield value
            editorState: editorState, // contentState -> convert this to Markdown or HTML for saving to DB
            slideState: initialSlideState
        }

        this.hashtagOnBlur = this.hashtagOnBlur.bind(this);
        this.hashtagOnFocus = this.hashtagOnFocus.bind(this);
        this.hashtagOnType = this.hashtagOnType.bind(this);
        this.titleOnType = this.titleOnType.bind(this);
        this.albumTitleOnType = this.albumTitleOnType.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleDateChangeChecked= this.handleDateChangeChecked.bind(this);
        this.handleShowDisplayEditDate = this.handleShowDisplayEditDate.bind(this);
        this.handleCreateAlbumChecked = this.handleCreateAlbumChecked.bind(this);

        this.changeSlide = this.changeSlide.bind(this);

        this.titleComponent = this.titleComponent.bind(this);
        this.editorComponent = this.editorComponent.bind(this);
        this.tagsComponent = this.tagsComponent.bind(this);
        this.extrasComponent = this.extrasComponent.bind(this);

        this.renderStandard = this.renderStandard.bind(this);
        this.renderResponsive = this.renderResponsive.bind(this);
    }

    handleDateChange(date) {
        this.setState({selectedDate: date});
    };

    handleDateChangeChecked(event){
        let flag = event.target.checked
        this.setState({selectedDateChecked: flag})
    }

    handleShowDisplayEditDate(event){
        let flag = event.target.checked
        this.setState({displayEditDateChecked: flag})
    }

    handleCreateAlbumChecked(event){
        let flag = event.target.checked
        this.setState({createAlbumChecked: flag})
    }

    hashtagOnType(event){
        let text = event.target.value
        let currentChar = text[text.length - 1]
        let previousNonSpaceChar = text[text.length - 2]

        // if initial hashtag is deleted, field will be empty, append new initial hashtag if user starts typing
        if(this.state.tags === ""){
            this.setState({tags: "#" + text})
        }else if(currentChar === " " && previousNonSpaceChar === "#"){
            return
        }else if(text === " "){
            this.setState({tags: "#"})
        }else if(text.endsWith(" ")){
            this.setState({tags: text + "#"})
        }else{
            this.setState({tags: text})
        }

    }

    hashtagOnBlur(event){
        let text = event.target.value
        if(text.endsWith("#")){
            let newText = text.substr(0, text.length - 1).trim()
            this.setState({tags: newText})
        }
    }

     hashtagOnFocus(event){
        if(!this.state.tags.endsWith(" #")){
            let tag = "#"
            if(this.state.tags.length === 0){
                this.setState({tags: tag})
            }else{
                this.setState({tags: this.state.tags + " #"})
            }
        }
    }

    onEditorStateChange(editorState){
        this.setState({
            editorState,
        });
    }

    titleOnType(event){
        let text = event.target.value
        this.setState({title: text})
    }

    albumTitleOnType(event){
        let text = event.target.value
        this.setState({albumTitle: text})
    }

    changeSlide(direction){
        let newSlideState = toggleCarousel(direction, this.state.slideState.slideIndex, this.state.slideState.slideCount)
        this.setState({slideState: newSlideState})
    }

    titleComponent(){
        return(
            <TextField
                style={{width: "100%"}}
                id="outlined-with-placeholder"
                label="Title"
                value={this.state.title}
                placeholder="Keep it short and baity ..."
                margin="normal"
                variant="outlined"
                inputProps={{maxLength: "120"}}
                onChange={this.titleOnType}
            />
        )
    }

    editorComponent(classes){
        let imageTool = {
            popupClassName: classes.imagePopup,
            uploadCallback: this.props.uploadImageCallback,
            previewImage: true,
            alt: {
                present: true,
                mandatory: false
            }
        }
        return(
            <Editor
                editorClassName={classes.editor}
                // toolbarClassName="wysiwyg-toolbar"
                editorState={this.state.editorState}
                onEditorStateChange={this.onEditorStateChange}
                toolbar={{
                    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'image', 'history'],
                    inline: { inDropdown: true },
                    list: { inDropdown: true },
                    textAlign: { inDropdown: true },
                    link: { inDropdown: true },
                    history: { inDropdown: true },
                    image: imageTool,
                }}
            />
        )
    }

    tagsComponent(){
        return(
            <TextField
                style={{width: "100%"}}
                id="outlined-with-placeholder"
                label="#tags"
                value={this.state.tags}
                margin="normal"
                variant="outlined"
                inputProps={{maxLength: "120"}}
                onChange={this.hashtagOnType}
                onBlur={this.hashtagOnBlur}
                onFocus={this.hashtagOnFocus}
            />
        )
    }

    extrasComponent(){
        return(
            <div>
                <div style={{display: "inline-block", verticalAlign: "middle"}}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DateTimePicker
                            margin="normal"
                            id="date-picker-dialog"
                            label="Post date"
                            value={this.state.selectedDate}
                            onChange={this.handleDateChange}
                            disabled={!this.state.selectedDateChecked}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </div>
                <div style={{display: "inline-block", verticalAlign: "middle", marginLeft: 20}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.selectedDateChecked}
                                onChange={this.handleDateChangeChecked}
                                value="checkedB"
                                color="primary"
                                inputProps={{
                                    'aria-label': 'secondary checkbox',
                                }}
                            />
                        }
                        label="Change post date"
                    />
                </div>
                <div style={{display: "inline-block", verticalAlign: "middle"}}>
                    <TextField
                        style={{width: "100%"}}
                        id="outlined-with-placeholder"
                        label="Album title"
                        value={this.state.albumTitle}
                        placeholder="A date or a few words"
                        margin="normal"
                        variant="outlined"
                        inputProps={{maxLength: "120"}}
                        onChange={this.albumTitleOnType}
                        disabled={!this.state.createAlbumChecked}
                    />
                </div>
                <div style={{display: "inline-block", verticalAlign: "middle", marginLeft: 20}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.createAlbumChecked}
                                onChange={this.handleCreateAlbumChecked}
                                value="checkedB"
                                color="primary"
                                inputProps={{
                                    'aria-label': 'secondary checkbox',
                                }}
                            />
                        }
                        label="Create album"
                    />
                </div>
                <div style={{display: "inline-block", verticalAlign: "middle", marginLeft: 20}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.displayEditDateChecked}
                                onChange={this.handleShowDisplayEditDate}
                                value="checkedB"
                                color="primary"
                                inputProps={{
                                    'aria-label': 'secondary checkbox',
                                }}
                            />
                        }
                        label="Display edit date on post page"
                    />
                </div>
            </div>
        )
    }

    renderResponsive(){
        const classes = {
            imagePopup: "wysiwyg-editor-image-popup-responsive",
            editor: "wysiwyg-editor-responsive"
        }

        return(
            <div>
                <div>
                    <SwipeableViews disabled springConfig={springConfig} index={this.state.slideState.slideIndex} style={{maxWidth: "96vw"}}>

                        <SlideContainer>
                            <Grid item style={{width: "100%", display: "flex", justifyContent: "center", alignItems:"center"}}>
                                {this.titleComponent()}
                            </Grid>
                        </SlideContainer>

                        <SlideContainer>
                            <Grid item style={{width: "100%", overflow: "visible"}}>
                                {this.editorComponent(classes)}
                            </Grid>
                        </SlideContainer>

                        <SlideContainer>
                            <Grid item style={{width: "100%"}}>
                                {this.tagsComponent()}
                            </Grid>

                            <Grid item style={{width: "100%", textAlign: "center"}}>
                                {this.extrasComponent()}
                            </Grid>
                        </SlideContainer>

                    </SwipeableViews>
                </div>

                <div style={{width: "100%", textAlign: "center"}}>
                    <HorizontalStepper steps={["Title", "Content", "Options"]}
                                       onBack={() => this.changeSlide("prev")}
                                       onNext={() => this.changeSlide("next")}
                                       onSubmit={() => this.props.onSubmit(this.state)}/>
                </div>
            </div>
        )
    }

    renderStandard(){
        const classes = {
            imagePopup: "wysiwyg-editor-image-popup",
            editor: "wysiwyg-editor"
        }

        return(
            <React.Fragment>
                <Grid item style={{width: "100%"}}>
                    {this.titleComponent()}
                </Grid>

                <Grid item style={{width: "100%"}}>
                    {this.extrasComponent()}
                </Grid>

                <Grid item style={{width: "100%"}}>
                    {this.editorComponent(classes)}
                </Grid>

                <Grid item style={{width: "100%"}}>
                    {this.tagsComponent()}
                </Grid>

                <Grid item style={{width: "100%"}}>
                    <Button onClick={() => this.props.onSubmit(this.state)} variant="contained" color="primary" style={{width: "100%"}}>
                        Post
                        <Icon>send</Icon>
                    </Button>
                </Grid>
            </React.Fragment>
        )
    }

    render(){
        return(
            <React.Fragment>
                <Hidden smUp implementation="js">
                    {this.renderResponsive()}
                </Hidden>
                <Hidden xsDown implementation="js">
                    {this.renderStandard()}
                </Hidden>
            </React.Fragment>
        )

    }
}
export default PostManagerForm;
