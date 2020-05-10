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
import AdminModal from "./AdminModal";
import CreateAlbum from "./CreateAlbum";
import { withStyles } from '@material-ui/core/styles';
import DeleteConfirmation from "./DeleteConfirmation";
import PostManager from "./PostManager";
import SlideContainer from "./SlideContainer";
import Grid from '@material-ui/core/Grid';
import Login from "./Login";
import About from "./About";
import {Switch, withRouter, Route} from 'react-router-dom'
import Menu from "./Menu";
import PostDummy from "./PostDummy";

export const PAGES = {
    FEED: 1,
    GALLERY: 2,
    ABOUT: 3,
    LOGIN: 4
}

export const PAGES_URLS = {
    1: "/",
    2: "/gallery",
    3: "/about",
    4: "/login"
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

// TODO: rename pageToShow to currentPage
const initialSlideState = {
    slideIndex: 0,
    slideNavi: null,
    slideCount: 3,
    itemToShow: null
}

class App extends React.Component{
    constructor(props){
        super(props);

        // TODO: refactor -> move modal related things to a `modal` object
        //  e.g. modal = {open, title, galleryCreation, postCreation, editingPost}
        this.state = {
            isAdmin: false, // for visual purpose only (e.g. show/not show admin bar), further auth done on API calls
            pageToShow: PAGES.FEED,
            mobileOpen: false,
            refreshFeed: false,
            modal: initialModal,
            slideState: initialSlideState,
        }

        this.checkLoggedIn = this.checkLoggedIn.bind(this);
        this.logout = this.logout.bind(this);

        this.readPost = this.readPost.bind(this);
        this.viewAlbumAndUpdateSlide = this.viewAlbumAndUpdateSlide.bind(this);
        this.viewPostAndUpdateSlide = this.viewPostAndUpdateSlide.bind(this);

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

        this.navigator = this.navigator.bind(this);
        this.setMobile = this.setMobile.bind(this);
        this.setRefreshFeed = this.setRefreshFeed.bind(this);

        this.renderBlog = this.renderBlog.bind(this);
        this.renderGallery = this.renderGallery.bind(this);
        this.renderAbout = this.renderAbout.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.renderAdminNav = this.renderAdminNav.bind(this);
    }

    componentDidMount() {
        this.checkLoggedIn()
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

    viewPostAndUpdateSlide(newDirection, post){
        let slideState = this.readPost(newDirection, post)
        this.setState({slideState: slideState})
        if(newDirection === "next"){
            this.props.history.push({pathname: `/post/` + `${post._id}`})
        }else if(newDirection === "prev"){
            this.props.history.push({pathname: `/`})
        }
    }

    viewAlbumAndUpdateSlide(newDirection, post){
        let slideState = this.readPost(newDirection, post)
        this.setState({slideState: slideState})
        if(newDirection === "next"){
            this.props.history.push({pathname: `/gallery/album/` + `${post._id}`})
        }else if(newDirection === "prev"){
            this.props.history.push({pathname: `/gallery`})
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

    // can this be done in each of the routes? instead of one monolithic navigator?
    // e.g. in the function that is passed as render in the route, e.g. in renderBlog, renderGallery, etc...
    navigator(newPage){
        // could change push to ".replace" see if it makes a difference
        this.props.history.push({pathname: PAGES_URLS[newPage]})
        if(newPage === PAGES.LOGIN && this.state.isAdmin){
            this.setState({mobileOpen: false})
            return
        }

        let {slideState, pageToShow} = this.state
        // if click on link for the same page that we are already on
        if(newPage === pageToShow){
            // and the carousel is on the second slide
            if(slideState.slideIndex === 1){
                // we just want to slide back to the first slide with a render
                // e.g. from page 1, slide 2 to slide 1 - Feed page, post slide to list of posts slide
                let newSlideState = this.readPost("prev", this.state.slideState.itemToShow)
                this.setState({slideState: newSlideState, mobileOpen: false})
            }else{
                // otherwise do nothing because we're already on the first slide of the requested page
                // e.g. page 1, slide 1 - Feed page, list of posts slide
                this.setState({mobileOpen: false})
            }
        }else{
            // if switching to another page, do a render to make new page appear
            this.setState({ pageToShow: newPage, slideState: initialSlideState, mobileOpen: false})
        }
    }

    setMobile(open){
        this.setState({ mobileOpen: open})
    }

    setRefreshFeed(flag){
        this.setState({refreshFeed: flag})
    }

    renderBlog(){
        console.log("rendering blog")
        let onEdit = this.state.isAdmin ? this.openEditPost : null
        let onDelete = this.state.isAdmin ? this.openDeletePost : null
        let external_visit = this.props.location.pathname.includes("post") && !this.state.slideState.itemToShow

        // if post is requesed from an externally clicked link (e.g. someone gave me a link and I click it)
        // then display just the post, otherwise display the feed!!
        if(external_visit){
            return(<About isAdmin={this.state.isAdmin}/>)
        }else{
            return(
                <SwipeableViews disabled springConfig={springConfig} index={this.state.slideState.slideIndex} style={{maxWidth: "96vw"}}>

                    <SlideContainer>
                        {/* this padding should match with padding in post/gallery (to avoid slider at bottom) */}
                        <Grid item className={"hyphenate"} style={{width: "100%"}}>
                            {/* TODO: change readPost={} to onRead={}*/}
                            <Feed refresh={this.state.refreshFeed}
                                  onRefresh={() => this.setRefreshFeed(false)}
                                  readPost={this.viewPostAndUpdateSlide}
                                  onEdit={onEdit}
                                  onDelete={onDelete}/>
                        </Grid>
                    </SlideContainer>

                    <SlideContainer>
                        <Grid item className={"hyphenate"} style={{width: "100%"}}>
                            {/* slideState.itemToShow && <Post ... /> does not work here because itemToShow becomes 0
                        if first post is selected, and 0 is not a truthy value,
                        so the first post will never be shown */}
                            {this.state.slideState.itemToShow != null ? <Post onEdit={onEdit}
                                                                              onDelete={onDelete}
                                                                              readPost={this.viewPostAndUpdateSlide}
                                                                              post={this.state.slideState.itemToShow}/> : <div></div>}
                        </Grid>
                    </SlideContainer>
                </SwipeableViews>
            )
        }
    }

    renderGallery(){
        return(
            <SlideContainer>
                <Grid item style={{width: "100%"}}>
                    <Gallery slideIndex={this.state.slideState.slideIndex} albumToShow={this.state.slideState.itemToShow} viewAlbum={this.viewAlbumAndUpdateSlide}/>
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
        return(<Login handleLogin={() => {
            this.setState({isAdmin: true, pageToShow: PAGES.FEED})
            this.props.history.push("/")
        }
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
        let {pageToShow, mobileOpen, modal } = this.state;
        return(
            <div className={classes.root}>
                <CssBaseline/>

                {/* zIndex lowered from 1200 to 1000 so that the LightBox can display images full screen*/}
                <div style={{zIndex: 1000}}>
                    <Menu navigator={this.navigator} adminNav={this.state.isAdmin ? this.renderAdminNav() : null}/>
                </div>


                {/**
                 If the state-based, manually URL-d navigation is kept instead of a purely route-based navigation, it is really difficult
                 to also involve route-based content. For example, if a post is manually URL-d after it's clicked on,
                 there isn't actually a route handler which displays that post, it's only displaying based on state.
                 However, if we then want to add a route handler to handle that same URL in case the request comes
                 from a shared link click, it is currently impossible.

                 (e.g. I copy URL from blog post and give it to someone, they paste it in their browser and go to it
                        issues:
                            - there is no route handler which could be set up to catch this pasted post URL AND catch the
                              non-pasted (locally navigated) post URL too if needed
                            - there is no slideState or itemToShow as soon as they click away from the post)
                            - there is no place to put the Switch component, the URLs made by the .replace() function
                              are fake, the app is still on the root URL (/)
                 **/}

                {/**
                    have to do the following:
                    - have a separate function for each feature carousel, e.g. gallery carousel, feed carousel
                    - have them handle the carousel routing manually instead of router (to enable smooth sliding animation)
                 **/}
                <main className={classes.content}>
                    {/*{pageToShow === PAGES.FEED && this.renderBlog()}*/}
                    {/*{pageToShow === PAGES.GALLERY && this.renderGallery()}*/}
                    {/*{pageToShow === PAGES.ABOUT && this.renderAbout()}*/}
                    {/*{pageToShow === PAGES.LOGIN && this.renderLogin()}*/}
                    <Switch>
                        {/* order of Routes ARE IMPORTANT*/}
                        <Route exact path='/about' render={this.renderAbout} key={this.props.location.pathname}/>
                        <Route exact path='/login' render={this.renderLogin} key={this.props.location.pathname}/>
                        <Route path='/gallery' render={this.renderGallery}/>
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