import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './style/editor.css'
import React from 'react'
import {Paper, Grid, Typography, IconButton, makeStyles} from '@material-ui/core'
import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';
import DeletePostIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import htmlToDraft from "html-to-draftjs";
import {ContentState, EditorState} from "draft-js";
import {Editor} from "react-draft-wysiwyg";
import Spinner from "./Spinner";
import {withRouter} from 'react-router-dom'
import { withStyles } from "@material-ui/core/styles"
import AlertBox, {variants} from "./AlertBox";
import {fetchPost} from "./api/posts";

// const useStyles = makeStyles(theme => ({
//     heading: {
//         padding: theme.spacing(1, 5),
//     },
//     body: {
//         padding: theme.spacing(2, 5),
//     },
// }));

// NOTE: there is a slight styling difference between accessing a post externally (via link) and via feed
const styles = theme => ({
    heading: {
        padding: theme.spacing(1, 5),
    },
    body: {
        padding: theme.spacing(2, 5),
    },
});

// props: post, onEdit, onDelete, readPost
class Post extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: null,
            post: null,
            title: "",
            editedOn: "",
            createdOn: "",
            error: null,

        }

        this.initPost = this.initPost.bind(this);
        this.renderDeleteIcon = this.renderDeleteIcon.bind(this);
        this.renderEditIcon = this.renderEditIcon.bind(this);
        this.showPost = this.showPost.bind(this);
    }

    componentDidMount() {
        if(!this.props.post){
            fetchPost(this.props.match.params.id).then(json => {
                if(json.error){
                    this.setState({error: json.error})
                }else{
                    this.setState(this.initPost(json))
                }
            })
        }
    }

    initPost(post){
        let content = htmlToDraft(post.html)

        let editorState = EditorState.createWithContent(ContentState.createFromBlockArray(content.contentBlocks))

        // const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1000px)' })
        // const classes = useStyles();
        // let postDimensions = {
        //     marginLeft: isTabletOrMobile ? 0 : "15%",
        //     marginRight: isTabletOrMobile ? 0 : "15%",
        //     width: isTabletOrMobile ? "100%" : "70%"
        // }

        let title = post.title
        let createdOn = new Date(post.createdOn).toLocaleString()
        let editedOn = post.displayEditDate ? (post.editedOn ? new Date(post.editedOn).toLocaleString() : null) : null

        return {post, editorState, title, createdOn, editedOn}
    }

    renderEditIcon(){
        const post = this.props.post ? this.props.post : this.state.post
        return(
            <IconButton
                edge="start"
                onClick={() => this.props.onEdit(post)}
                style={{color: "dodgerblue", padding: "7px"}}
            >
                <EditIcon />
            </IconButton>
        )
    }

    // can't use this.props.post because it might be null (e.g. if it came from a shared URL)
    renderDeleteIcon(){
        const post = this.props.post ? this.props.post : this.state.post
        return(
            <IconButton
                edge="start"
                onClick={() => this.props.onDelete(post)}
                style={{color: "red", padding: "7px"}}
            >
                <DeletePostIcon />
            </IconButton>
        )
    }

    showPost(editor){
        const { classes } = this.props;
        return(
            <React.Fragment> {/* this padding should match with padding in app.js' swipeableview */}
                <Grid container spacing={1}>
                    {/* TODO: ideally the post itself should not contain any buttons, should be passed as children*/}
                    {this.props.readPost &&
                    <Grid item xs={1} style={{display: "flex"}}>
                        <Button onClick={() => this.props.readPost("prev", editor.post)} style={{"textAlign": "center", "minHeight": "100%", "minWidth": "100%"}} className={classes.headingButton} variant="outlined">
                            <ArrowBack />
                        </Button>
                    </Grid>
                    }
                    <Grid item xs={this.props.readPost == null ? 12 : 11}>
                        <Paper style={{"textAlign": "left"}} elevation={1} className={classes.heading}>
                            <Grid container spacing={1} direction="row" justify="space-between" alignItems="center">
                                <Grid item>
                                    <Typography variant="h5" component="h3">
                                        {editor.title}
                                    </Typography>
                                    {/* if createdOn exists, show it*/}
                                    {editor.createdOn &&
                                    <Typography component="p">
                                        {editor.createdOn}
                                    </Typography>
                                    }
                                    {editor.editedOn &&
                                    <Typography component="p" style={{color: "#bdbdbd"}}>
                                        {"Edited: " + editor.editedOn}
                                    </Typography>
                                    }
                                </Grid>
                                <Grid item>
                                    {this.props.onEdit && this.renderEditIcon()}
                                    {this.props.onDelete && this.renderDeleteIcon()}
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                <br />

                <Grid container style={{justifyContent: "center"}}>
                    <Grid item style={{minWidth: "100%"}}>
                        <Paper elevation={1} className={classes.body}>
                            <Typography style={{whiteSpace: 'pre-wrap', marginLeft: "15%", marginRight: "15%"}} component="div">
                                <Editor
                                    editorClassName="wysiwyg-editor-readOnly"
                                    editorState={editor.editorState}
                                    readOnly={true}
                                    toolbarHidden={true}
                                    style={{overflow: "visible", position: "relative"}}
                                />
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </React.Fragment>
        )
    }

    render() {
        const {post} = this.props
        // if page loaded via link, fetch it and use state, otherwise load the passed post (coming from feed)
        const editor = post ? this.initPost(post) : this.state
        return (
            <React.Fragment>
                {editor.error ?
                        <div style={{textAlign: "center"}}>
                            <AlertBox open={true} variant={variants.error} message={editor.error}/>
                        </div>
                    :
                    editor.editorState ? this.showPost(editor) : <Spinner/>
                }
            </React.Fragment>
        );
    }
}

export default withRouter(withStyles(styles)(Post));