import React from 'react';
import './style/App.css'
import CssBaseline from '@material-ui/core/CssBaseline';
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
import {checkLoggedIn} from "./api/auth";
import PhotoViewer from "./PhotoViewer";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";
import CircularProgressButton from "./CircularProgressButton";
import {Icon} from "@material-ui/core";

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
    post: null,
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
        //  e.g. modal = {open, title, galleryCreation, postCreation, post}
        this.state = {
            isAdmin: false, // for visual purpose only (e.g. show/not show admin bar), further auth done on API calls
            pageToShow: PAGES.FEED,
            mobileOpen: false,
            refreshFeed: false,
            modal: initialModal,
            slideState: initialSlideState,
        }

        this.onLogout = this.onLogout.bind(this);

        this.readPost = this.readPost.bind(this);
        this.viewAlbumAndUpdateSlide = this.viewAlbumAndUpdateSlide.bind(this);
        this.viewPostAndUpdateSlide = this.viewPostAndUpdateSlide.bind(this);

        this.openCreatePost = this.openCreatePost.bind(this);
        this.openEditPost = this.openEditPost.bind(this);
        this.openDeletePost = this.openDeletePost.bind(this);
        this.openPostManager = this.openPostManager.bind(this);
        this.closeDeletePost = this.closeDeletePost.bind(this);
        this.closePostManager = this.closePostManager.bind(this);

        this.openCreateAlbum = this.openCreateAlbum.bind(this);
        this.submitAlbum = this.submitAlbum.bind(this);

        this.navigator = this.navigator.bind(this);
        this.setMobile = this.setMobile.bind(this);
        this.setRefreshFeed = this.setRefreshFeed.bind(this);

        this.renderBlog = this.renderBlog.bind(this);
        this.renderGallery = this.renderGallery.bind(this);
        this.renderAbout = this.renderAbout.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
    }

    componentDidMount() {
        checkLoggedIn().then(isAdmin => {
            this.setState({isAdmin: isAdmin})
        })
    }

    onLogout(){
        this.setState({
            isAdmin: false,
            pageToShow: PAGES.FEED,
            refreshFeed: true,
            slideState: initialSlideState
        })
        // TODO: add logout success/fail message/alertbox
        // if user saved token from the cookie previously outside browser, they can still use it to access their session
        // would be nice to be able to invalidate the token server side
        // this is logout() in auth.js (success is its return value)
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
            // don't use goBack(), if the user came via a URL, goBack() will literally return to the last page the user visited
            this.props.history.push({pathname: `/`})
        }
    }

    viewAlbumAndUpdateSlide(newDirection, post){
        let slideState = this.readPost(newDirection, post)
        this.setState({slideState: slideState})
        if(newDirection === "next"){
            this.props.history.push({pathname: `/gallery/album/${post._id}/`})
        }else if(newDirection === "prev"){
            // don't use goBack(), if the user came via a URL, goBack() will literally return to the last page the user visited
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
                post: post,
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
                post: post
            }
        })
    }

    // this is only called when post was actually deleted
    // in which case, we can redirect to front page
    closeDeletePost(post){
        // TODO maybe do something with the post argument, e.g. display success/error message
        this.setState({
            refreshFeed: true,
            slideState: initialSlideState,
            modal: {
                open: false,
                title: "",
                post: null,
                galleryCreation: false,
                postCreation: false,
                postDeletion: false,
            }
        })
        this.props.history.push("/")
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
                post: null,
            },
            slideState: slideState
        })
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
                post: null,
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
        let onEdit = this.state.isAdmin ? this.openEditPost : null
        let onDelete = this.state.isAdmin ? this.openDeletePost : null
        let external_visit = this.props.location.pathname.includes("post") && !this.state.slideState.itemToShow

        // if post is requesed from an externally clicked link (e.g. someone gave me a link and I click it)
        // then display just the post, otherwise display the feed!!
        if(external_visit){
            // dynamic route, let it handle via the router so we can easily access :id
            return(
                <Route path='/post/:id' render={() => {
                    return(<Post onEdit={onEdit}
                          onDelete={onDelete}
                          readPost={this.viewPostAndUpdateSlide}/>)
                }}/>
            )
        }else{
            return(
                <SwipeableViews disabled springConfig={springConfig} index={this.state.slideState.slideIndex} style={styles.slides.blog.container}>

                    <SlideContainer>
                        {/* this padding should match with padding in post/gallery (to avoid slider at bottom) */}
                        <Grid item className={"hyphenate"} style={styles.slides.blog.feed.container}>
                            {/* TODO: change readPost={} to onRead={}*/}
                            <Feed refresh={this.state.refreshFeed}
                                  onRefresh={() => this.setRefreshFeed(false)}
                                  readPost={this.viewPostAndUpdateSlide}
                                  onEdit={onEdit}
                                  onDelete={onDelete}/>
                        </Grid>
                    </SlideContainer>

                    <SlideContainer>
                        <Grid item className={"hyphenate"} style={styles.slides.blog.post.container}>
                            {/* slideState.itemToShow && <Post ... /> does not work here because itemToShow becomes 0
                        if first post is selected, and 0 is not a truthy value,
                        so the first post will never be shown */}
                            {this.state.slideState.itemToShow && <Post onEdit={onEdit}
                                                                       onDelete={onDelete}
                                                                       readPost={this.viewPostAndUpdateSlide}
                                                                       post={this.state.slideState.itemToShow}/>}
                        </Grid>
                    </SlideContainer>
                </SwipeableViews>
            )
        }
    }

    renderGallery(){
        let external_visit = this.props.location.pathname.includes("gallery/album") && !this.state.slideState.itemToShow
        if(external_visit){
            // this is dirty and so is the same thing we did for Post routing, refactor ASAP
            return(
                // note the optional /imdIdx route denoted by question mark
                <Route path='/gallery/album/:albumId/:imgIdx?' render={() => {
                    return(
                        <SlideContainer>
                            <PhotoViewer>
                                <div style={styles.gallery.buttons.container}>
                                    <Button onClick={() => this.viewAlbumAndUpdateSlide("prev", null)} size="small">
                                        <ArrowBack/>
                                    </Button>
                                    <CircularProgressButton onClick={() => console.log("pressed download")}>
                                        Download
                                        <Icon>save</Icon>
                                    </CircularProgressButton>
                                </div>
                            </PhotoViewer>
                        </SlideContainer>
                    )
                }}/>
            )
        }else{
            return(
                <SlideContainer>
                    <Grid item style={styles.slides.gallery.container}>
                        <Gallery slideIndex={this.state.slideState.slideIndex} albumToShow={this.state.slideState.itemToShow} viewAlbum={this.viewAlbumAndUpdateSlide}/>
                    </Grid>
                </SlideContainer>
            )
        }
    }

    renderAbout(){
        return(
            <SlideContainer>
                <Grid item className={"hyphenate"} style={styles.slides.about.container}>
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

    render(){
        const { classes } = this.props
        let {modal, isAdmin} = this.state;
        return(
            <div className={classes.root}>
                <CssBaseline/>

                {/* zIndex lowered from 1200 to 1000 so that the LightBox can display images full screen*/}
                <div style={styles.menu.container}>
                    <Menu navigator={this.navigator}
                          onLogout={isAdmin && this.onLogout}
                          createPost={isAdmin && this.openCreatePost}
                          createAlbum={isAdmin && this.openCreateAlbum}/>
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
                    <Switch>
                        {/* order of Routes ARE IMPORTANT*/}
                        <Route exact path='/about' render={this.renderAbout} key={this.props.location.pathname}/>
                        {!isAdmin &&
                            <Route exact path='/login' render={this.renderLogin} key={this.props.location.pathname}/>
                        }
                        <Route path='/gallery' render={this.renderGallery}/>
                        <Route path='/' render={this.renderBlog}/>
                    </Switch>
                </main>

                <div>
                    <AdminModal title={modal.title} open={modal.open} dispose={() => this.closePostManager(false, null)}>
                        {modal.postCreation && <PostManager onSubmit={this.closePostManager} post={modal.post}/>}
                        {modal.galleryCreation && <CreateAlbum onCreate={this.submitAlbum}/>}
                        {/*{modal.galleryCreation && <PhotoPreviewPane onCreate={this.submitAlbum}/>}*/}
                        {modal.postDeletion && <DeleteConfirmation onConfirm={this.closeDeletePost} toDelete={modal.post}/>}
                    </AdminModal>
                </div>
            </div>
        );
    }
}

const appBarHeight = 35;
const useStyles = theme => ({
    root: {
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1),
        marginTop: `${appBarHeight}px`,
        minHeight: "90vh"
    },
});

const styles = {
    menu: {
        container: {
            zIndex: 1000
        }
    },
    slides: {
        blog: {
            container: {
                maxWidth: "96vw"
            },
            feed: {
                container: {
                    width: "100%"
                }
            },
            post: {
                container: {
                    width: "100%"
                }
            }

        },
        gallery:{
            container: {
                width: "100%"
            }
        },
        about: {
            container: {
                width: "100%"
            }
        }
    },
    gallery: {
        buttons: {
            container: {
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between"
            }
        }
    }
}

export default withStyles(useStyles)(withRouter(App));