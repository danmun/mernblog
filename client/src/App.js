import React from "react";
import "./style/App.css";
import CssBaseline from "@material-ui/core/CssBaseline";
import SwipeableViews from "react-swipeable-views";
import { toggleCarousel } from "./utils";
import Feed from "./posts/Feed";
import Post from "./posts/Post";
import Gallery from "./gallery/Gallery";
import AdminModal from "./common/AdminModal";
import CreateAlbum from "./gallery/CreateAlbum";
import { withStyles } from "@material-ui/core/styles";
import DeleteConfirmation from "./posts/DeleteConfirmation";
import PostManager from "./posts/PostManager";
import SlideContainer from "./common/SlideContainer";
import Grid from "@material-ui/core/Grid";
import Login from "./auth/Login";
import About from "./posts/About";
import { Switch, withRouter, Route } from "react-router-dom";
import Menu from "./nav/Menu";
import { checkLoggedIn } from "./api/auth";
import PhotoViewer from "./gallery/PhotoViewer";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";
import CircularProgressButton from "./common/CircularProgressButton";
import { Icon } from "@material-ui/core";
import MfaManager from "./auth/MfaManager";

export const PAGES = {
    FEED: 1,
    GALLERY: 2,
    ABOUT: 3,
    LOGIN: 4,
};

export const PAGES_URLS = {
    1: "/",
    2: "/gallery",
    3: "/about",
    4: "/login",
};

const BLOG_TITLE = "wanderingdnm blog";

const springConfig = {
    duration: "1s",
    easeFunction: "cubic-bezier(0.1, 0.35, 0.2, 1)",
    delay: "0.1s", // so that the `Read Post` button shows its animation
};

// TODO: rename pageToShow to currentPage
const initialSlideState = {
    slideIndex: 0,
    slideNavi: null,
    slideCount: 3,
    itemToShow: null,
};

class App extends React.Component {
    constructor(props) {
        super(props);

        // TODO: refactor -> move modal related things to a `modal` object
        //  e.g. modal = {open, title, galleryCreation, postCreation, post}
        this.state = {
            isAdmin: false, // for visual purpose only (e.g. show/not show admin bar), further auth done on API calls
            pageToShow: PAGES.FEED,
            mobileOpen: false,
            refreshFeed: false,
            slideState: initialSlideState,
            modal: Modals.INITIAL(),
        };

        this.onLogout = this.onLogout.bind(this);

        this.readPost = this.readPost.bind(this);
        this.viewAlbumAndUpdateSlide = this.viewAlbumAndUpdateSlide.bind(this);
        this.viewPostAndUpdateSlide = this.viewPostAndUpdateSlide.bind(this);
        this.viewPostAndUpdateSlideExternalVisit = this.viewPostAndUpdateSlideExternalVisit.bind(this);
        this.clearPostOnTransitionEnd = this.clearPostOnTransitionEnd.bind(this);

        this.openCreatePost = this.openCreatePost.bind(this);
        this.openEditPost = this.openEditPost.bind(this);
        this.openDeletePost = this.openDeletePost.bind(this);
        this.openCreateAbout = this.openCreateAbout.bind(this);
        this.openEditAbout = this.openEditAbout.bind(this);
        this.closeDeletePost = this.closeDeletePost.bind(this);
        this.closePostManager = this.closePostManager.bind(this);
        this.onPostCreated = this.onPostCreated.bind(this);
        this.onPostEdited = this.onPostEdited.bind(this);
        this.openMfaSetup = this.openMfaSetup.bind(this);

        this.openCreateAlbum = this.openCreateAlbum.bind(this);
        this.submitAlbum = this.submitAlbum.bind(this);

        this.navigator = this.navigator.bind(this);

        this.renderBlog = this.renderBlog.bind(this);
        this.renderGallery = this.renderGallery.bind(this);
        this.renderAbout = this.renderAbout.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.setPageTitle = this.setPageTitle.bind(this);
    }

    setPageTitle(pageTitle) {
        document.title = `${pageTitle} | ${BLOG_TITLE}`
    }

    componentDidMount() {
        checkLoggedIn().then((isAdmin) => {
            this.setState({ isAdmin: isAdmin });
        });
    }

    onLogout() {
        this.setState({
            isAdmin: false,
            pageToShow: PAGES.FEED,
            refreshFeed: true,
            slideState: initialSlideState,
        });
        this.props.history.push({ pathname: PAGES_URLS[PAGES.FEED] });
        // TODO: add logout success/fail message/alertbox
        // if user saved token from the cookie previously outside browser, they can still use it to access their session
        // would be nice to be able to invalidate the token server side
        // this is logout() in auth.js (success is its return value)
    }

    readPost(newDirection, post) {
        let slideState = toggleCarousel(
            newDirection,
            this.state.slideState.slideIndex,
            this.state.slideState.slideCount
        );
        slideState.itemToShow = post;
        return slideState;
    }

    viewPostAndUpdateSlide(newDirection, post) {
        let slideState = this.readPost(newDirection, post);
        this.setState({ slideState: slideState });
        if (newDirection === "next") {
            this.props.history.push({ pathname: `/post/${post.slug}` });
        } else if (newDirection === "prev") {
            // don't use goBack(), if the user came via a URL, goBack() will literally return to the last page the user visited
            this.setPageTitle("Feed");
            this.props.history.push({ pathname: `/` });
        }
    }

    viewPostAndUpdateSlideExternalVisit(newDirection, post) {
        // When clicking "Back" button in a post page that was loaded via link
        // the slide animation doesn't work anyway, so we can just null the post here
        // without affecting the slide animation
        this.viewPostAndUpdateSlide(newDirection, null);
    }

    viewAlbumAndUpdateSlide(newDirection, post) {
        let slideState = this.readPost(newDirection, post);
        this.setState({ slideState: slideState });
        if (newDirection === "next") {
            this.props.history.push({
                pathname: `/gallery/album/${post._id}/`,
            });
        } else if (newDirection === "prev") {
            // don't use goBack(), if the user came via a URL, goBack() will literally return to the last page the user visited
            this.props.history.push({ pathname: `/gallery` });
        }
    }

    openCreatePost() {
        this.setState({
            modal: Modals.POST_MANAGER(
                Modals.POST_MANAGER_TYPES.CREATE_POST,
                null,
                false
            ),
        });
    }

    openEditPost(post) {
        this.setState({
            modal: Modals.POST_MANAGER(
                Modals.POST_MANAGER_TYPES.EDIT_POST,
                post,
                false
            ),
        });
    }

    openCreateAbout() {
        this.setState({
            modal: Modals.POST_MANAGER(
                Modals.POST_MANAGER_TYPES.CREATE_ABOUT,
                null,
                true
            ),
        });
    }

    openEditAbout(post) {
        this.setState({
            modal: Modals.POST_MANAGER(
                Modals.POST_MANAGER_TYPES.EDIT_ABOUT,
                post,
                true
            ),
        });
    }

    openDeletePost(post) {
        this.setState({ modal: Modals.POST_DELETION(post) });
    }

    // this is only called when post was actually deleted
    // in which case, we can redirect to front page
    closeDeletePost(post) {
        // TODO maybe do something with the post argument, e.g. display success/error message
        this.setState({
            refreshFeed: true,
            slideState: initialSlideState,
            modal: Modals.INITIAL(),
        });
        this.props.history.push("/");
    }

    onPostCreated(post) {
        return this.closePostManager(true, post); // signal to setRefreshFeed
    }

    onPostEdited(post) {
        return this.closePostManager(true, post);
    }

    closePostManager(stateChanged, post) {
        let slideState = this.state.slideState;
        const { pageToShow } = this.state;
        // if we are on feed, we need to manage the slide state
        // if we are not on feed (e.g. About), we need not worry about the slide state
        if (pageToShow === PAGES.FEED || pageToShow === PAGES.ABOUT) {
            // PAGES.ABOUT only happens if we navigate to About within the app, not if we visit via URL
            slideState = {
                ...this.state.slideState,
                itemToShow: post || this.state.slideState.itemToShow,
            };
        }

        this.setState({
            refreshFeed: stateChanged,
            modal: Modals.INITIAL(),
            slideState: slideState,
        });
    }

    openCreateAlbum() {
        this.setState({ modal: Modals.CREATE_ALBUM() });
    }

    openMfaSetup() {
        this.setState({ modal: Modals.MFA_SETUP() });
    }

    submitAlbum(album) {
        let { title, tags, description, images } = album;

        console.log(title);
        console.log(tags);
        console.log(description);
        console.log(images[0]);

        // TODO: send album to server for storing
        // TODO: refresh gallery (by updating state)
        this.setState({ modal: Modals.INITIAL() });
    }

    // TODO:CLEANUP note that this does not fire on external load, e.g. if we visit URL /about, state.pageToShow is still set to 1
    //              this causes problems when trying to use closePostManager and itemToShow
    // can this be done in each of the routes? instead of one monolithic navigator?
    // e.g. in the function that is passed as render in the route, e.g. in renderBlog, renderGallery, etc...
    navigator(newPage) {
        // could change push to ".replace" see if it makes a difference
        this.props.history.push({ pathname: PAGES_URLS[newPage] });
        if (newPage === PAGES.LOGIN && this.state.isAdmin) {
            if (this.state.mobileOpen) this.setState({ mobileOpen: false });
            // we do not show login page when admin is logged in
            return;
        }

        let { slideState, pageToShow } = this.state;
        // if click on link for the same page that we are already on
        if (newPage === pageToShow) {
            // and the carousel is on the second slide
            if (slideState.slideIndex === 1) {
                // we just want to slide back to the first slide with a render
                // e.g. from page 1, slide 2 to slide 1 - Feed page, post slide to list of posts slide
                let newSlideState = this.readPost(
                    "prev",
                    this.state.slideState.itemToShow
                );
                this.setState({ slideState: newSlideState, mobileOpen: false });
            } else {
                // otherwise do nothing because we're already on the first slide of the requested page
                // e.g. page 1, slide 1 - Feed page, list of posts slide
                if (this.state.mobileOpen) this.setState({ mobileOpen: false });
            }
        } else {
            // if switching to another page, do a render to make new page appear;
            // also reset itemToShow (in slideState) to empty
            this.setState({
                pageToShow: newPage,
                slideState: initialSlideState,
                mobileOpen: false,
            });
        }
    }

    /**
     * Reset the slide state when the slide animation
     * ends after transitioning from post page to feed.
     */
    clearPostOnTransitionEnd(){
        if(this.state.slideState.slideIndex === 0){
            this.setState({slideState: initialSlideState})
        }
    }

    renderBlog() {
        let onEdit = this.state.isAdmin ? this.openEditPost : null;
        let onDelete = this.state.isAdmin ? this.openDeletePost : null;
        let isExternalVisit =
            this.props.location.pathname.includes("post") &&
            !this.state.slideState.itemToShow;

        // if post is requesed from an externally clicked link (e.g. someone gave me a link and I click it)
        // then display just the post, otherwise display the feed!!
        if (isExternalVisit) {
            // dynamic route, let it handle via the router so we can easily access :id
            // post itself will be fetched via API within the Post component, since we don't pass a Post object as prop
            // during an external request (Post page loads and calls API with slug)
            return (
                <Route
                    path="/post/:slug"
                    render={() => {
                        return (
                            <Post
                                onEdit={onEdit}
                                onDelete={onDelete}
                                readPost={this.viewPostAndUpdateSlideExternalVisit}
                                setPageTitle={this.setPageTitle}
                            />
                        );
                    }}
                />
            );
        } else {
            const {slideState} = this.state;
            const isOnPostPage = slideState.itemToShow && slideState.slideIndex === 1
            this.setPageTitle(isOnPostPage ? slideState.itemToShow.title : "Feed");
            return (
                <SwipeableViews
                    disabled
                    onTransitionEnd={this.clearPostOnTransitionEnd}
                    springConfig={springConfig}
                    index={this.state.slideState.slideIndex}
                    style={styles.slides.blog.container}
                >
                    <SlideContainer>
                        {/* this padding should match with padding in post/gallery (to avoid slider at bottom) */}
                        <Grid
                            item
                            className={"hyphenate"}
                            style={styles.slides.blog.feed.container}
                        >
                            {/* TODO: change readPost={} to onRead={}*/}
                            <Feed
                                refresh={this.state.refreshFeed}
                                onRefresh={() =>
                                    this.setState({ refreshFeed: false })
                                }
                                readPost={this.viewPostAndUpdateSlide}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        </Grid>
                    </SlideContainer>

                    <SlideContainer>
                        <Grid
                            item
                            className={"hyphenate"}
                            style={styles.slides.blog.post.container}
                        >
                            {/* slideState.itemToShow && <Post ... /> does not work here because itemToShow becomes 0
                        if first post is selected, and 0 is not a truthy value,
                        so the first post will never be shown */}
                            {/*we must allow it to render at all times otherwise animation will be jagged (post disappears before it could slide back to feed*/}
                            {this.state.slideState.itemToShow && (
                                <Post
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    readPost={this.viewPostAndUpdateSlide}
                                    post={this.state.slideState.itemToShow}
                                />
                            )}
                        </Grid>
                    </SlideContainer>
                </SwipeableViews>
            );
        }
    }

    renderGallery() {
        this.setPageTitle("Gallery");
        let isExternalVisit =
            this.props.location.pathname.includes("gallery/album") &&
            !this.state.slideState.itemToShow;
        if (isExternalVisit) {
            // this is dirty and so is the same thing we did for Post routing, refactor ASAP
            return (
                // note the optional /imdIdx route denoted by question mark
                <Route
                    path="/gallery/album/:albumId/:imgIdx?"
                    render={() => {
                        return (
                            <SlideContainer>
                                <PhotoViewer>
                                    {/* TODO:CLEANUP why is this not <Gallery ... > ? why the need to specify components here instead of using gallery with props?
                                                gallery should be referring to exact same variable (component) on route and non-route renders!
                                                currently they have 2 different renders (noticed because button had different text on routed render vs non routed render
                                */}
                                    <div
                                        style={styles.gallery.buttons.container}
                                    >
                                        <Button
                                            onClick={() =>
                                                this.viewAlbumAndUpdateSlide(
                                                    "prev",
                                                    null
                                                )
                                            }
                                            size="small"
                                        >
                                            <ArrowBack />
                                        </Button>
                                        <CircularProgressButton
                                            loading={false} // change once implemented downloads
                                            onClick={() =>
                                                console.log("pressed download")
                                            }
                                        >
                                            Download
                                            <Icon>save</Icon>
                                        </CircularProgressButton>
                                    </div>
                                </PhotoViewer>
                            </SlideContainer>
                        );
                    }}
                />
            );
        } else {
            return (
                <SlideContainer>
                    <Grid item style={styles.slides.gallery.container}>
                        <Gallery
                            slideIndex={this.state.slideState.slideIndex}
                            albumToShow={this.state.slideState.itemToShow}
                            viewAlbum={this.viewAlbumAndUpdateSlide}
                        />
                    </Grid>
                </SlideContainer>
            );
        }
    }

    renderAbout() {
        this.setPageTitle("About");
        const { isAdmin, slideState } = this.state;
        const onCreate = isAdmin ? this.openCreateAbout : null;
        const onEdit = isAdmin ? this.openEditAbout : null;
        return (
            <SlideContainer>
                <Grid
                    item
                    className={"hyphenate"}
                    style={styles.slides.about.container}
                >
                    <About
                        onCreate={onCreate}
                        onEdit={onEdit}
                        post={slideState.itemToShow}
                    />
                </Grid>
            </SlideContainer>
        );
    }

    renderLogin() {
        return (
            <Login
                handleLogin={() => {
                    this.setState({ isAdmin: true, pageToShow: PAGES.FEED });
                    this.props.history.push("/");
                }}
            />
        );
    }

    render() {
        const { classes } = this.props;
        let { modal, isAdmin } = this.state;
        return (
            <div className={classes.root}>
                <CssBaseline />

                {/* zIndex lowered from 1200 to 1000 so that the LightBox can display images full screen*/}
                <div style={styles.menu.container}>
                    <Menu
                        navigator={this.navigator}
                        onLogout={isAdmin && this.onLogout}
                        createPost={isAdmin && this.openCreatePost}
                        createAlbum={isAdmin && this.openCreateAlbum}
                        mfaSetup={isAdmin && this.openMfaSetup}
                    />
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
                        <Route
                            exact
                            path="/about"
                            render={this.renderAbout}
                            key={this.props.location.pathname}
                        />
                        {!isAdmin && (
                            <Route
                                exact
                                path="/login"
                                render={this.renderLogin}
                                key={this.props.location.pathname}
                            />
                        )}
                        <Route path="/gallery" render={this.renderGallery} />
                        <Route path="/" render={this.renderBlog} />
                    </Switch>
                </main>

                <div>
                    {/* Solving this with Routes is more complicated and creates just as much fog, while also requires touching the Switch too*/}
                    {isAdmin && (
                        <AdminModal
                            title={modal.title}
                            open={modal.open}
                            dispose={() => this.closePostManager(false, null)}
                        >
                            {modal.postCreation && (
                                <PostManager
                                    onCreated={this.onPostCreated}
                                    onEdited={this.onPostEdited}
                                    post={modal.post}
                                    isAbout={modal.isAbout}
                                />
                            )}
                            {modal.mfaSetup && <MfaManager />}
                            {modal.galleryCreation && (
                                <CreateAlbum onCreate={this.submitAlbum} />
                            )}
                            {/*{modal.galleryCreation && <PhotoPreviewPane onCreate={this.submitAlbum}/>}*/}
                            {modal.postDeletion && (
                                <DeleteConfirmation
                                    onConfirm={this.closeDeletePost}
                                    toDelete={modal.post}
                                />
                            )}
                        </AdminModal>
                    )}
                </div>
            </div>
        );
    }
}

const appBarHeight = 35;
const useStyles = (theme) => ({
    root: {
        display: "flex",
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1),
        marginTop: `${appBarHeight}px`,
        // Fix white gap on Login page bottom
        minHeight: "100vh",
    },
});

const styles = {
    menu: {
        container: {
            zIndex: 1000,
        },
    },
    slides: {
        blog: {
            container: {
                maxWidth: "96vw",
            },
            feed: {
                container: {
                    width: "100%",
                },
            },
            post: {
                container: {
                    width: "100%",
                },
            },
        },
        gallery: {
            container: {
                width: "100%",
            },
        },
        about: {
            container: {
                width: "100%",
            },
        },
    },
    gallery: {
        buttons: {
            container: {
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
            },
        },
    },
};

class Modals {
    static POST_MANAGER_TYPES = {
        CREATE_POST: 0,
        EDIT_POST: 1,
        CREATE_ABOUT: 2,
        EDIT_ABOUT: 3,
    };

    static TITLES = {
        CREATE_ALBUM: "Create an album",
        MFA_SETUP: "Set up 2-factor authentication",
        POST_DELETION: "Are you sure you want to delete this post?",
        POST_MANAGER: [
            "Create a post",
            "Edit your post",
            "Add an About section",
            "Edit the About section",
        ],
    };

    static POST_DELETION(post) {
        return {
            open: true,
            postDeletion: true,
            title: this.TITLES.POST_DELETION,
            post: post,
        };
    }

    static POST_MANAGER(type, post, isAbout) {
        return {
            open: true,
            postCreation: true,
            title:
                type < this.TITLES.POST_MANAGER.length
                    ? this.TITLES.POST_MANAGER[type]
                    : "",
            post: post,
            isAbout: isAbout,
        };
    }

    static CREATE_ALBUM() {
        return {
            open: true,
            galleryCreation: true,
            title: this.TITLES.CREATE_ALBUM,
        };
    }

    static MFA_SETUP() {
        return {
            open: true,
            mfaSetup: true,
            title: this.TITLES.MFA_SETUP,
        };
    }

    // for consistency
    static INITIAL() {
        return {};
    }
}

export default withStyles(useStyles)(withRouter(App));
