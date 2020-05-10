import React from 'react';
import './style/App.css'
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import AddAlbumIcon from '@material-ui/icons/AddPhotoAlternate';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddPostIcon from '@material-ui/icons/AddCircle';
import SwipeableViews from 'react-swipeable-views';
import {toggleCarousel} from "./utils";
import Feed from './Feed'
import Post from './Post'
import Gallery from "./Gallery";
import ResponsiveDrawer from "./ResponsiveDrawer";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import AdminModal from "./AdminModal";
import CreateAlbum from "./CreateAlbum";
import { withStyles } from '@material-ui/core/styles';
import DeleteConfirmation from "./DeleteConfirmation";
import PostManager from "./PostManager";
import SlideContainer from "./SlideContainer";
import Grid from '@material-ui/core/Grid';
import Login from "./Login";
import About from "./About";
import Menu from "./Menu";
import {Switch, withRouter, Route} from 'react-router-dom'
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Fucking from "./Fucking";

export const PAGES = {
    FEED: 1,
    GALLERY: 2,
    ABOUT: 3,
    LOGIN: 4
}

const appBarHeight = 35;
const styles = theme => ({
    root: {
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1),
        marginTop: `${appBarHeight}px`,
    },
});

const springConfig = {
    duration: "1s",
    easeFunction: "cubic-bezier(0.1, 0.35, 0.2, 1)",
    delay: "0.1s", // so that the `Read Post` button shows its animation
}

const initialModal = {
    open: false,
    title: "",
    galleryCreation: false,
    postCreation: false,
    postDeletion: false,
    editingPost: null,
}

const initialSlideState = {
    slideIndex: 0,
    slideNavi: null,
    slideCount: 3,
    itemToShow: null
}

const routes = ["/", "/post"];

class App extends React.Component{
    constructor(props){
        super(props);

        // TODO: refactor -> move modal related things to a `modal` object
        //  e.g. modal = {open, title, galleryCreation, postCreation, editingPost}
        this.state = {
            isAdmin: false, // for visual purpose only (e.g. show/not show admin bar), further auth done on API calls
            refreshFeed: false,
            modal: initialModal,
            slideState: initialSlideState,
            showCarousel: false
        }

        this.checkLoggedIn = this.checkLoggedIn.bind(this);
        this.logout = this.logout.bind(this);

        this.readPost = this.readPost.bind(this);
        this.readAndUpdateSlide = this.readAndUpdateSlide.bind(this);

        this.openCreatePost = this.openCreatePost.bind(this);
        this.openEditPost = this.openEditPost.bind(this);
        this.openDeletePost = this.openDeletePost.bind(this);
        this.openPostManager = this.openPostManager.bind(this);
        this.closeDeletePost = this.closeDeletePost.bind(this);
        this.closePostManager = this.closePostManager.bind(this);

        this.submitNewPost = this.submitNewPost.bind(this);
        this.submitEditedPost = this.submitEditedPost.bind(this);
        
        this.onPostManagerDone = this.onPostManagerDone.bind(this);

        this.openCreateAlbum = this.openCreateAlbum.bind(this);
        this.submitAlbum = this.submitAlbum.bind(this);

        this.setRefreshFeed = this.setRefreshFeed.bind(this);

        this.renderBlog = this.renderBlog.bind(this);
        this.renderGallery = this.renderGallery.bind(this);
        this.renderAbout = this.renderAbout.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.renderAdminNav = this.renderAdminNav.bind(this);

        this.post_ = this.post_.bind(this);
        this.feed_ = this.feed_.bind(this);
    }

    componentDidMount() {
        this.checkLoggedIn()
        setTimeout(() => {
            this.setState({
                showCarousel: true,
            });
        }, 0);
    }

    checkLoggedIn(){
        fetch('/isAdmin',
            {
                credentials: 'include'
            })
            .then(raw => {
                return raw.json()
            }).then(res => {
                this.setState({isAdmin: res.isAdmin})
            })
            .catch(err => {
                // console.error(err);
            });
    }

    logout(){
        // TODO: add logout success/fail message/alertbox
        // if user saved token from the cookie previously outside browser, they can still use it to access their session
        // would be nice to be able to invalidate the token server side
        fetch('/logout',
            {
                credentials: 'include'
            })
            .then(res => {
                if (res.status === 200) {
                    this.setState({
                        isAdmin: false,
                        pageToShow: PAGES.FEED,
                        refreshFeed: true,
                        slideState: initialSlideState
                    })
                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    readPost(newDirection, post){
        let slideState = toggleCarousel(newDirection, this.state.slideState.slideIndex, this.state.slideState.slideCount)
        slideState.itemToShow = post
        return slideState
    }

    readAndUpdateSlide(newDirection, post){
        console.log("read entered")
        let slideState = this.readPost(newDirection, post)
        // we use this history (url) manipulation because the sliding animation is only cool if the post is already existing in memory and we can
        // display it immediately as the carousel is starting to slide...
        // if we don't have the post object's content stored in the feed, then we have to fetch it by going to a url
        // (actually navigating to a url) and loading it from the server then displaying it, but this will make the sliding
        // animation uncool

        // document.location.hash = `/post?id=${post._id}`

        // unfortunately, none of the stuff I tried works :(
        // console.log("this thing")
        // if(newDirection === "prev"){
        //     this.props.history.push("/")
        // }
        // if(newDirection === "next"){
        //     console.log("this happened")
        //     window.history.replaceState(null, null, `#/post/${post._id}`);
        // }

        // this.setState({slideState: slideState})

        const {location, history} = this.props
        const currentScreen = routes.indexOf(location.pathname);

        if(newDirection === "prev"){
            history.push({
                pathname: routes[(currentScreen - 1) % routes.length],
                state: { previousScreen: currentScreen, post: post}
            })
        }else if(newDirection === "next"){
            history.push({
                pathname: routes[(currentScreen + 1) % routes.length],
                state: { previousScreen: currentScreen, post: post }
            })
        }
    }

    openCreatePost(){
        this.openPostManager("Create a post", null)
    }

    openEditPost(post){
        this.openPostManager("Edit your post", post)
    }

    openDeletePost(post){
        console.log("Deleting post \"" + post.title + "\"")

        this.setState({
            modal : {
                open: true,
                title: "Are you sure you want to delete this post?",
                galleryCreation: false,
                postCreation: false,
                postDeletion: true,
                editingPost: post,
            }
        })
    }

    openPostManager(title, post){
        this.setState({
            modal: {
                open: true,
                title: title,
                galleryCreation: false,
                postCreation: true,
                editingPost: post
            }
        })
    }

    closeDeletePost(post){
        // TODO maybe do something with the post argument, e.g. display success/error message
        this.setState({
            refreshFeed: true,
            slideState: initialSlideState,
            modal: {
                open: false,
                title: "",
                editingPost: null,
                galleryCreation: false,
                postCreation: false,
                postDeletion: false,
            }
        })
    }

    closePostManager(stateChanged, editedPost){
        let slideState = this.state.slideState
        // if we are on feed, we need to manage the slide state
        // if we are not on feed (e.g. About), we need not worry about the slide state
        if(this.state.pageToShow === PAGES.FEED){
            slideState = {
                ... this.state.slideState,
                itemToShow: editedPost ? editedPost : this.state.slideState.itemToShow
            }
        }

        this.setState({
            refreshFeed: stateChanged,
            modal: {
                open: false,
                postCreation: false,
                galleryCreation: false,
                editingPost: null,
            },
            slideState: slideState
        })
    }

    submitNewPost(post){
        console.log("Submitting newly created post ...")
        fetch('/post', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(post)
        }).then(function(response) {
            return response;
        }).then(function(data) {
            // idk why this is needed
        });

        this.closePostManager(true, null) // signal to setRefreshFeed
    }

    submitEditedPost(post){
        let that = this
        console.log("Submitting edited post ...")
        fetch('/edit?id=' + post.id, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(post)
        }).then(function(raw) {
            return raw.json();
        }).then(function(res) {
            // we need to call onDone here because the DB operation for /edit doesnt have async environment like /post
            return that.closePostManager(true, res.post) // signal to setRefreshFeed
        });
    }

    onPostManagerDone(post){
        if(post.id === null || post.id.trim().length === 0){
            this.submitNewPost(post)
        }else{
            this.submitEditedPost(post)
        }
    }

    openCreateAlbum(){
        this.setState({
            modal: {
                open: true,
                title: "Create an album",
                galleryCreation: true,
                postCreation: false,
            }
        })
    }

    submitAlbum(album){
        let {title, tags, description, images} = album

        console.log(title)
        console.log(tags)
        console.log(description)
        console.log(images[0])

        // TODO: send album to server for storing
        // TODO: refresh gallery (by updating state)
        this.setState({
            modal: {
                open: false,
                title: "",
                editingPost: null,
                galleryCreation: false,
                postCreation: false,
            }
        })
    }

    setRefreshFeed(flag){
        this.setState({refreshFeed: flag})
    }

    // NOTE: the issue is, we used to use SlideContainer, but that was removed after refactoring to use
    // the blog with routes and transitions!!!
    // that's why the CSS is so messed up

    // right now, the transition works partially with the router, the post transitions fine but the feed jerks up
    // when sliding from and to it

    // suggestions:
    //      - back up the current feed_() and post_() functions
    //      - paste the divs and Grid setup from SlideContainer to feed_() and post_() as appropriate
    //          - check the original carousel code on GitHub master!
    // even better suggestion: redo the entire app in SemanticUI... materialui sucks

    feed_(){
        let width = 100 - appBarHeight
        let onEdit = this.state.isAdmin ? this.openEditPost : null
        let onDelete = this.state.isAdmin ? this.openDeletePost : null
        return(
            <div style={{maxWidth: "96vw"}}>
                <SlideContainer>
                    {/*style={{minWidth: "85%", position: "absolute"}}*/}
                    <Grid item className={"hyphenate"} style={{width: "100%"}}>
                        {/* TODO: change readPost={} to onRead={}*/}
                        <Feed refresh={this.state.refreshFeed}
                              onRefresh={() => this.setRefreshFeed(false)}
                              readPost={this.readAndUpdateSlide}
                              onEdit={onEdit}
                              onDelete={onDelete}/>
                    </Grid>
                </SlideContainer>
            </div>
        )
    }

    post_(){
        let onEdit = this.state.isAdmin ? this.openEditPost : null
        let onDelete = this.state.isAdmin ? this.openDeletePost : null
        const {post} = this.props.location.state
        return(
            <div style={{maxWidth: "96vw"}}>
                <SlideContainer>
                <Grid item className={"hyphenate"} style={{width: "100%"}}>
                    {/* slideState.itemToShow && <Post ... /> does not work here because itemToShow becomes 0
                    if first post is selected, and 0 is not a truthy value,
                    so the first post will never be shown */}
                    <Post onEdit={onEdit}
                          onDelete={onDelete}
                          readPost={this.readAndUpdateSlide}
                          post={post}/>
                </Grid>
                </SlideContainer>
            </div>
        )
    }

    renderBlog(){
        const {location} = this.props
        const currentScreen = routes.indexOf(location.pathname);
        const { state } = location;
        const previousScreen = state ? state.previousScreen : 0;
        const animationClassNames =
            currentScreen > previousScreen ? "slide-forward" : "slide-backward";
        return (
            <TransitionGroup
                childFactory={child =>
                    React.cloneElement(child, {
                        classNames: animationClassNames
                    })
                }
            >
                <CSSTransition
                    key={location.key}
                    classNames={animationClassNames}
                    timeout={1000}
                >
                    <Switch location={location}>
                        <Route path="/" render={this.feed_} exact />
                        <Route path="/post" render={this.post_} />
                    </Switch>
                </CSSTransition>
            </TransitionGroup>
        );
    }
    __renderBlog(){
        let onEdit = this.state.isAdmin ? this.openEditPost : null
        let onDelete = this.state.isAdmin ? this.openDeletePost : null

        return(
            <TransitionGroup>
                <CSSTransition key={this.props.location.key} classNames={"slide"} timeout={1000}>
                    <Switch location={this.props.location}>
                        <Route exact path="/" render={this.feed_}/>
                        <Route path="/post" render={this.post_} />
                    </Switch>
                </CSSTransition>
            </TransitionGroup>
        )
    }

    renderGallery(){
        return(
            <SlideContainer>
                <Grid item style={{width: "100%"}}>
                    <Gallery slideIndex={this.state.slideState.slideIndex} albumToShow={this.state.slideState.itemToShow} viewAlbum={this.readAndUpdateSlide}/>
                </Grid>
            </SlideContainer>
        )
    }

    renderAbout(){
        return(
            <SlideContainer>
                <Grid item className={"hyphenate"} style={{width: "100%"}}>
                    <About isAdmin={this.state.isAdmin}/>
                </Grid>
            </SlideContainer>
        )
    }

    renderLogin(){
        return(<Login handleLogin={() => this.setState({isAdmin: true, pageToShow: PAGES.FEED})
        }/>)
    }

    renderAdminNav(){
        return(
            <React.Fragment>
                <IconButton
                    aria-label="open drawer"
                    edge="start"
                    onClick={() => this.openCreatePost()}
                    style={{color: "green"}}
                >
                    <AddPostIcon/>
                </IconButton>
                <IconButton
                    aria-label="open drawer"
                    edge="start"
                    onClick={() => this.openCreateAlbum()}
                    style={{color: "green"}}
                >
                    <AddAlbumIcon />
                </IconButton>
                <IconButton
                    aria-label="open drawer"
                    edge="start"
                    onClick={() => this.logout()}
                    style={{color: "black"}}
                >
                    <ExitToAppIcon />
                </IconButton>
            </React.Fragment>
        )
    }

    render(){
        const { classes } = this.props
        let { modal } = this.state;
        return(
            <div className={classes.root}>
                <CssBaseline/>

                {/* zIndex lowered from 1200 to 1000 so that the LightBox can display images full screen*/}
                <div style={{zIndex: 1000}}>
                    <Menu adminNav={this.state.isAdmin ? this.renderAdminNav() : null}/>
                </div>

                <main className={classes.content}>
                    <Switch>
                        <Route exact path='/gallery' render={this.renderGallery} key={this.props.location.pathname}/>
                        <Route exact path='/about' render={this.renderAbout} key={this.props.location.pathname}/>
                        <Route exact path='/login' render={this.renderLogin} key={this.props.location.pathname}/>
                        {/* upon removing key={this.props.location.pathname} from the / path, the sliding works with carousel */}
                        <Route path='/' render={this.renderBlog}/>
                    </Switch>
                </main>

                <div>
                    <AdminModal title={modal.title} open={modal.open} dispose={() => this.closePostManager(false, null)}>
                        {modal.postCreation && <PostManager onDone={this.onPostManagerDone} editingPost={modal.editingPost}/>}
                        {modal.galleryCreation && <CreateAlbum onCreate={this.submitAlbum}/>}
                        {/*{modal.galleryCreation && <PhotoPreviewPane onCreate={this.submitAlbum}/>}*/}
                        {modal.postDeletion && <DeleteConfirmation onConfirm={this.closeDeletePost} toDelete={modal.editingPost}/>}
                    </AdminModal>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(withRouter(App));