import React from "react";
import TextTruncate from 'react-text-truncate';
import DeletePostIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {CardContent, CardActions, Card, Button, Typography,
    IconButton, Grid} from '@material-ui/core'
import Spinner from "./Spinner";
import {fetchFeed} from "./api/feed";

class Feed extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            loadingPosts: true,
            posts: [],
        }

        this.fetch = this.fetch.bind(this);
        this.showFeed = this.showFeed.bind(this);
        this.renderEditIcon = this.renderEditIcon.bind(this);
        this.renderDeleteIcon = this.renderDeleteIcon.bind(this);
        this.shortenTextTo = this.shortenTextTo.bind(this);

        // this.truncateTextTo = this.truncateTextTo.bind(this);
    }

    // FIXME | TODO: (low priority - only admin side issue [when deleting a post])
    //      after deleting from feed view, feed will jerk to post when we want to view a post
    //      example: 1. empty db, add post 1, add post 2, do not refresh page, do not view the posts
    //               2. delete the first (bottom) post from feed view
    //               3. attempt to "read" remaining post
    //               4. view will snap/jump to post instead of sliding to it
    shouldComponentUpdate(nextProps, nextState) {
        // if we return false, componentdidupdate will not trigger, thus, feed will not update
        // if we return true, componentdidupdate will trigger, feed will update but the preview text will become jerky
        if(this.props.refresh !== nextProps.refresh){
            return true
        }

        if(this.refs.truncatedText){
            this.refs.truncatedText.onResize();
            return false;
            // https://stackoverflow.com/a/50995875
            // (componentDidUpdate didnt seem to fire on prop change, because this was returning false since
            // there already existed posts so this.refs.truncatedText was true)
        }
        return true;

        // NOTE: if we return true, load the page, click on read post, it will not transition but jerk to post
    }

    componentDidMount() {
        this.fetch()

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.refresh){
            this.fetch()
        }
    }

    fetch(){
        fetchFeed().then(json => {
            this.setState({
                posts: json,
                loadingPosts: false
            }, this.props.onRefresh) // after updating state, signal end of refresh to main controller (App.js)
        })
        // this.props.onRefresh()
        // Catch any errors we hit and update the app
        // .catch(error => this.setState({ error, loadingPosts: false }));
    }

    renderEditIcon(post){
        return(
            <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={() => this.props.onEdit(post)}
                style={styles.icons.edit}
            >
                <EditIcon />
            </IconButton>
        )
    }

    renderDeleteIcon(post){
        return(
            <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={() => this.props.onDelete(post)}
                style={styles.icons.delete}
            >
                <DeletePostIcon />
            </IconButton>
        )
    }

    showFeed(){
        let posts = this.state.posts
        if(posts.length === 0){
            return(
                <React.Fragment>
                    <div style={styles.emptyList}>
                        There are no posts to display.
                    </div>
                </React.Fragment>)
        }else{
            return(
                <React.Fragment>
                    {this.state.posts.map((post, posti) => {
                        return <div key={"post" + posti + "_" + post.createdOn}>
                            <Card>
                                <CardContent>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                    >
                                        {new Date(post.createdOn).toLocaleString()}
                                    </Typography>
                                    <Typography variant="h5" component="h2">
                                        {post.title}
                                    </Typography>
                                    <Typography variant="body2" component="div" style={styles.previewText}>

                                        {/*{this.truncateTextTo(2, post.plaintext)}*/}
                                        {this.shortenTextTo(120, post.plaintext)}

                                    </Typography>
                                    <br />
                                    <Typography color="textSecondary">
                                        {"#" + post.tags.join(" #")}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Grid
                                        container
                                        direction="row"
                                        justify="space-between"
                                        alignItems="center"
                                    >
                                        <Grid item>
                                            <Button size="small" onClick={() => this.props.readPost("next", post)}>Read post</Button>
                                        </Grid>
                                        <Grid item>
                                            {this.props.onEdit && this.renderEditIcon(post)}
                                            {this.props.onDelete && this.renderDeleteIcon(post)}
                                        </Grid>
                                    </Grid>
                                </CardActions>
                            </Card>
                            <br />
                        </div>
                    })}
                </React.Fragment>
            )
        }
    }

    shortenTextTo(length, text){
        return text.length > length ? text.substring(0, length - 3) + "..." : text.substring(0, length);
    }

    truncateTextTo(lines, text){
        return(
            <TextTruncate
                ref="truncatedText"
                line={lines}
                truncateText=" . . ."
                text={text}
                // textTruncateChild={<a href="#">Read on</a>}
            />
        )
    }

    render(){
        let {loadingPosts} = this.state
        return(
            <React.Fragment>
                {loadingPosts ? <Spinner/> : this.showFeed()}
            </React.Fragment>)
    }
}

const styles = {
    emptyList: {
        textAlign: "center"
    },
    icons: {
        edit: {
            color: "dodgerblue", padding: "7px"
        },
        delete: {
            color: "red", padding: "7px"
        }
    },
    previewText: {
        paddingTop: "2vh",
        paddingLeft: "5vw",
        paddingRight: "20vw"
    }
}

export default Feed;