import "../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./style/editor.css";
import React from "react";
import {
    Paper,
    Grid,
    Typography,
    IconButton,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";
import DeletePostIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import htmlToDraft from "html-to-draftjs";
import { ContentState, EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import Spinner from "./Spinner";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import AlertBox, { variants } from "./AlertBox";
import { fetchPost } from "./api/posts";
import PropTypes from 'prop-types';

// props: post, onEdit, onDelete, readPost
class Post extends React.Component {
    constructor(props) {
        super(props);
        // TODO:CLEANUP state can be simplified to {post, editorState, error},
        //              other info is probably available from the post object,
        //              check what info is contained in post when we
        //                      - use fetchPost in componentDidMount
        //                      - pass the post via props when we do <Post ...> in App.js
        this.state = {
            editorState: null,
            post: null,
            title: "",
            editedOn: "",
            createdOn: "",
            publishedAt: "",
            error: null,
        };

        this.initPost = this.initPost.bind(this);
        this.renderDeleteIcon = this.renderDeleteIcon.bind(this);
        this.renderEditIcon = this.renderEditIcon.bind(this);
        this.showPost = this.showPost.bind(this);
        this.postDateComponent = this.postDateComponent.bind(this);
    }

    componentDidMount() {
        if (!this.props.post) {
            fetchPost(this.props.match.params.id).then((json) => {
                if (json.error) {
                    this.setState({ error: json.error });
                } else {
                    this.setState(this.initPost(json));
                }
            });
        }
    }

    initPost(post) {
        let content = htmlToDraft(post.html);

        let editorState = EditorState.createWithContent(
            ContentState.createFromBlockArray(content.contentBlocks)
        );

        // const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1000px)' })
        // const classes = useStyles();
        // let postDimensions = {
        //     marginLeft: isTabletOrMobile ? 0 : "15%",
        //     marginRight: isTabletOrMobile ? 0 : "15%",
        //     width: isTabletOrMobile ? "100%" : "70%"
        // }

        let title = post.title
        let createdOn = new Date(post.createdOn).toLocaleString()
        let publishedAt = post.publishedAt ? new Date(post.publishedAt).toLocaleString() : null
        // TODO:CLEANUP why don't we just use createdOn from post, why need to put it separately?
        //              (we add publishedAt in the same manner for consistency for now, tidy up later)
        let editedOn = post.displayEditDate ? (post.editedOn ? new Date(post.editedOn).toLocaleString() : null) : null

        return { post, editorState, title, createdOn, publishedAt, editedOn };
    }

    renderEditIcon() {
        const post = this.props.post ? this.props.post : this.state.post;
        return (
            <IconButton
                edge="start"
                onClick={() => this.props.onEdit(post)}
                style={ styles.title.icons.edit }
            >
                <EditIcon />
            </IconButton>
        );
    }

    // can't use this.props.post because it might be null (e.g. if it came from a shared URL)
    renderDeleteIcon() {
        const post = this.props.post ? this.props.post : this.state.post;
        return (
            <IconButton
                edge="start"
                onClick={() => this.props.onDelete(post)}
                style={ styles.title.icons.delete }
            >
                <DeletePostIcon />
            </IconButton>
        );
    }

    postDateComponent(postDateText){
        return(
            <Typography component="p">
                {postDateText}
            </Typography>
        )
    }

    showPost(editor) {
        const { classes } = this.props;
        return (
            <React.Fragment>
                {" "}
                {/* this padding should match with padding in app.js' swipeableview */}
                <Grid container spacing={1}>
                    {/* TODO: ideally the post itself should not contain any buttons, should be passed as children*/}
                    {this.props.readPost && (
                        <Grid item xs={1} style={styles.title.nav.container}>
                            <Button
                                onClick={() => this.props.readPost("prev", editor.post)}
                                style={styles.title.nav.button}
                                // TODO:CLEANUP headingButton doesn't exist
                                className={classes.headingButton}
                                variant="outlined"
                            >
                                <ArrowBack />
                            </Button>
                        </Grid>
                    )}
                    <Grid item xs={this.props.readPost == null ? 12 : 11}>
                        <Paper
                            style={styles.title.details.container}
                            elevation={1}
                            className={classes.heading}
                        >
                            <Grid
                                container
                                spacing={1}
                                direction="row"
                                justify="space-between"
                                alignItems="center"
                            >
                                <Grid item>
                                    <Typography variant="h5" component="h3">
                                        {editor.title}
                                    </Typography>
                                    {/* if createdOn exists, show it */}
                                    {/* TODO:CLEANUP refactor once initPost is refactored (use dates from post instead of return obj of initPost */}
                                    {editor.publishedAt ? this.postDateComponent(editor.publishedAt) : this.postDateComponent("DRAFT")}
                                    {editor.editedOn && (
                                        <Typography
                                            component="p"
                                            style={styles.title.details.edited}
                                        >
                                            {"Edited: " + editor.editedOn}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item>
                                    {this.props.onEdit && this.renderEditIcon()}
                                    {this.props.onDelete &&
                                        this.renderDeleteIcon()}
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
                <br />
                <Grid container style={styles.editor.container}>
                    <Grid item style={styles.editor.itemContainer}>
                        <Paper elevation={1} className={classes.body}>
                            <Typography
                                style={styles.editor.typography}
                                component="div"
                            >
                                <Editor
                                    editorClassName="wysiwyg-editor-readOnly"
                                    editorState={editor.editorState}
                                    readOnly={true}
                                    toolbarHidden={true}
                                    style={styles.editor.self}
                                />
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }

    render() {
        const { post } = this.props;
        // if page loaded via link, fetch it and use state, otherwise load the passed post (coming from feed)
        const editor = post ? this.initPost(post) : this.state;
        return (
            <React.Fragment>
                {editor.error ? (
                    <div style={styles.alert.container}>
                        <AlertBox
                            open={true}
                            variant={variants.error}
                            message={editor.error}
                        />
                    </div>
                ) : editor.editorState ? (
                    this.showPost(editor)
                ) : (
                    <Spinner />
                )}
            </React.Fragment>
        );
    }
}

// NOTE: there is a slight styling difference between accessing a post externally (via link) and via feed
const useStyle = (theme) => ({
    heading: {
        padding: theme.spacing(1, 5),
    },
    body: {
        padding: theme.spacing(2, 5),
    },
});

const styles = {
    alert: {
        container: {
            textAlign: "center"
        }
    },
    title: {
        icons: {
            edit: {
                color: "dodgerblue",
                padding: "7px",
            },
            delete: {
                color: "red",
                padding: "7px"
            }
        },
        nav: {
            container: {
                display: "flex"
            },
            button: {
                textAlign: "center",
                minHeight: "100%",
                minWidth: "100%",
            }
        },
        details: {
            container: {
                textAlign: "left"
            },
            edited: {
                color: "#bdbdbd"
            }
        }
    },
    editor: {
        container: {
            justifyContent: "center"
        },
        itemContainer: {
            minWidth: "100%"
        },
        typography: {
            whiteSpace: "pre-wrap",
            marginLeft: "15%",
            marginRight: "15%",
        },
        self: {
            overflow: "visible",
            position: "relative",
        }
    }
}

Post.propTypes = {
    post: PropTypes.object,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    readPost: PropTypes.func
}

export default withRouter(withStyles(useStyle)(Post));
