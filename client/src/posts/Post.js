import "../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../style/editor.css";
import React from "react";
import { Paper, Grid, Typography, IconButton } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";
import DeletePostIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import htmlToDraft from "html-to-draftjs";
import { ContentState, EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import Spinner from "../common/Spinner";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import AlertBox, { variants } from "../common/AlertBox";
import { fetchPost } from "../api/posts";
import PropTypes from "prop-types";

class Post extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editorState: null,
            post: null,
            error: null,
        };

        this.initEditor = this.initEditor.bind(this);
        this.renderDeleteIcon = this.renderDeleteIcon.bind(this);
        this.renderEditIcon = this.renderEditIcon.bind(this);
        this.showPost = this.showPost.bind(this);
        this.publishedDateComponent = this.publishedDateComponent.bind(this);
        this.editedDateComponent = this.editedDateComponent.bind(this);
        this.dateToStr = this.dateToStr.bind(this);
    }

    componentDidMount() {
        if (!this.props.post) {
            fetchPost(this.props.match.params.id).then((json) => {
                if (json.error) {
                    this.setState({ error: json.error });
                } else {
                    this.setState(this.initEditor(json));
                }
            });
        }
    }

    initEditor(post) {
        // TODO:CLEANUP investigate usage of the useMediaQuery in a class component
        //              (work on reducing excessive content squeeze on mobile)
        // const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1000px)' })
        // const classes = useStyles();
        // let postDimensions = {
        //     marginLeft: isTabletOrMobile ? 0 : "15%",
        //     marginRight: isTabletOrMobile ? 0 : "15%",
        //     width: isTabletOrMobile ? "100%" : "70%"
        // }

        const error = null;
        let content = htmlToDraft(post.html);

        let editorState = EditorState.createWithContent(
            ContentState.createFromBlockArray(content.contentBlocks)
        );

        return { post, editorState, error };
    }

    renderEditIcon() {
        const post = this.props.post || this.state.post;
        return (
            <IconButton
                edge="start"
                onClick={() => this.props.onEdit(post)}
                style={styles.title.icons.edit}
            >
                <EditIcon />
            </IconButton>
        );
    }

    renderDeleteIcon() {
        const post = this.props.post || this.state.post;
        return (
            <IconButton
                edge="start"
                onClick={() => this.props.onDelete(post)}
                style={styles.title.icons.delete}
            >
                <DeletePostIcon />
            </IconButton>
        );
    }

    publishedDateComponent(date) {
        const text = date ? this.dateToStr(date) : "DRAFT";
        return <Typography component="p">{text}</Typography>;
    }

    editedDateComponent(date) {
        return (
            <Typography component="p" style={styles.title.details.edited}>
                {"Edited: " + this.dateToStr(date)}
            </Typography>
        );
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
                                onClick={() =>
                                    this.props.readPost("prev", editor.post)
                                }
                                style={styles.title.nav.button}
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
                                        {editor.post.title}
                                    </Typography>
                                    {this.publishedDateComponent(
                                        editor.post.publishedAt
                                    )}
                                    {editor.post.editedOn &&
                                        editor.post.displayEditDate &&
                                        this.editedDateComponent(
                                            editor.post.editedOn
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

    dateToStr(date) {
        return new Date(date).toLocaleString("ja-JP");
    }

    render() {
        // if post in props, it's coming from the feed
        // if post in state, it's coming from URL visit
        const { post } = this.props;
        let editor = null;
        if (post) {
            // editor is created "in memory"
            editor = this.initEditor(post);
        } else {
            // editor is taken from "state"
            editor = this.state;
        }

        if (editor.post) {
            return this.showPost(editor);
        } else if (editor.error) {
            return (
                <React.Fragment>
                    <div style={styles.alert.container}>
                        <AlertBox
                            open={true}
                            variant={variants.error}
                            message={editor.error}
                        />
                    </div>
                </React.Fragment>
            );
        } else {
            return <Spinner />;
        }
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
            textAlign: "center",
        },
    },
    title: {
        icons: {
            edit: {
                color: "dodgerblue",
                padding: "7px",
            },
            delete: {
                color: "red",
                padding: "7px",
            },
        },
        nav: {
            container: {
                display: "flex",
            },
            button: {
                textAlign: "center",
                minHeight: "100%",
                minWidth: "100%",
            },
        },
        details: {
            container: {
                textAlign: "left",
            },
            edited: {
                color: "#bdbdbd",
            },
        },
    },
    editor: {
        container: {
            justifyContent: "center",
        },
        itemContainer: {
            minWidth: "100%",
        },
        typography: {
            whiteSpace: "pre-wrap",
            // TODO:CLEANUP modify these margins to reduce excessive content squeeze on mobile
            marginLeft: "15%",
            marginRight: "15%",
        },
        self: {
            overflow: "visible",
            position: "relative",
        },
    },
};

Post.propTypes = {
    post: PropTypes.object,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    readPost: PropTypes.func,
};

export default withRouter(withStyles(useStyle)(Post));
