import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './style/editor.css'
import React from 'react'
import {Paper, Grid, Typography, IconButton, makeStyles} from '@material-ui/core'
import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';
import DeletePostIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {useMediaQuery} from 'react-responsive'
import htmlToDraft from "html-to-draftjs";
import {ContentState, EditorState} from "draft-js";
import {Editor} from "react-draft-wysiwyg";

const useStyles = makeStyles(theme => ({
    heading: {
        padding: theme.spacing(1, 5),
    },
    body: {
        padding: theme.spacing(2, 5),
    },
}));

function Post (props) {
    let post = props.post
    let content = htmlToDraft(post.html)

    let editorState = EditorState.createWithContent(ContentState.createFromBlockArray(content.contentBlocks))

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1000px)' })
    const classes = useStyles();
    let postDimensions = {
        marginLeft: isTabletOrMobile ? 0 : "15%",
        marginRight: isTabletOrMobile ? 0 : "15%",
        width: isTabletOrMobile ? "100%" : "70%"
    }

    let createdOn = new Date(post.createdOn).toLocaleString()
    let editedOn = post.displayEditDate ? (post.editedOn ? new Date(post.editedOn).toLocaleString() : null) : null
    return(
        <React.Fragment> {/* this padding should match with padding in app.js' swipeableview */}
            <Grid container spacing={1}>
                {/* TODO: ideally the post itself should not contain any buttons, should be passed as children*/}
                {props.readPost &&
                    <Grid item xs={1} style={{display: "flex"}}>
                        <Button onClick={() => props.readPost("prev", post)} style={{"textAlign": "center", "minHeight": "100%", "minWidth": "100%"}} className={classes.headingButton} variant="outlined">
                            <ArrowBack />
                        </Button>
                    </Grid>
                }
                <Grid item xs={props.readPost == null ? 12 : 11}>
                    <Paper style={{"textAlign": "left"}} elevation={1} className={classes.heading}>
                        <Grid container spacing={1} direction="row" justify="space-between" alignItems="center">
                            <Grid item>
                                <Typography variant="h5" component="h3">
                                    {post.title}
                                </Typography>
                                {/* if createdOn exists, show it*/}
                                {createdOn &&
                                <Typography component="p">
                                    {createdOn}
                                </Typography>
                                }
                                {editedOn &&
                                <Typography component="p" style={{color: "#bdbdbd"}}>
                                    {"Edited: " + editedOn}
                                </Typography>
                                }
                            </Grid>
                            <Grid item>
                                {props.onEdit && renderEditIcon(props.onEdit, post)}
                                {props.onDelete && renderDeleteIcon(props.onDelete, post)}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <br />

            <Grid container style={{justifyContent: "center"}}>
                <Grid item style={{minWidth: "100%"}}>
                    <Paper elevation={1} className={classes.body}>
                        <Typography style={{whiteSpace: 'pre-wrap', marginLeft: postDimensions.marginLeft, marginRight: postDimensions.marginRight}} component="div">
                                <Editor
                                    editorClassName="wysiwyg-editor-readOnly"
                                    editorState={editorState}
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

function renderEditIcon(onEdit, post){
    return(
        <IconButton
            edge="start"
            onClick={() => onEdit(post)}
            style={{color: "dodgerblue", padding: "7px"}}
        >
            <EditIcon />
        </IconButton>
    )
}

function renderDeleteIcon(onDelete, post){
    return(
        <IconButton
            edge="start"
            onClick={() => onDelete(post)}
            style={{color: "red", padding: "7px"}}
        >
            <DeletePostIcon />
        </IconButton>
    )
}

export default Post;
