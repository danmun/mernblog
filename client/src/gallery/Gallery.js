import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import SwipeableViews from "react-swipeable-views";
import Album from "../gallery/Album";
import PhotoViewer from "../gallery/PhotoViewer";
import SlideContainer from "../common/SlideContainer";
import ArrowBack from "@material-ui/icons/ArrowBack";
import Spinner from "../common/Spinner";
import CircularProgressButton from "../common/CircularProgressButton";
import { Icon } from "@material-ui/core";
import { fetchGallery } from "../api/gallery";
import PropTypes from "prop-types";

const springConfig = {
    duration: "1s",
    easeFunction: "cubic-bezier(0.1, 0.35, 0.2, 1)",
    delay: "0.1s", // gives enough time for the user to see the `Read Post` button's animation
};

class Gallery extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDownloading: false,
            loading: true,
            albums: [],
        };

        this.createAlbum = this.createAlbum.bind(this);
        this.fetch = this.fetch.bind(this);
        this.showGallery = this.showGallery.bind(this);
        this.downloadAlbum = this.downloadAlbum.bind(this);
    }

    componentDidMount() {
        this.fetch();
    }

    fetch() {
        fetchGallery().then((json) => {
            this.setState({
                albums: json,
                loading: false,
            });
        });
    }

    createAlbum(viewAlbum, album) {
        return (
            <Album album={album}>
                <div style={styles.albumThumb.button.container}>
                    <Button
                        onClick={() => viewAlbum("next", album)}
                        size="small"
                    >
                        Explore
                    </Button>
                </div>
            </Album>
        );
    }

    showGallery() {
        let albums = this.state.albums;
        let albumToShow = this.props.albumToShow;
        if (albums.length === 0) {
            return (
                <React.Fragment>
                    <div style={styles.emptyList}>
                        There are no albums to display.
                    </div>
                </React.Fragment>
            );
        } else {
            return (
                <SwipeableViews
                    disabled
                    springConfig={springConfig}
                    index={this.props.slideIndex}
                    style={styles.slides.container}
                >
                    <SlideContainer>
                        {albums.map((album, albumi) => {
                            return (
                                <Grid key={album.thumb} item>
                                    {this.createAlbum(
                                        this.props.viewAlbum,
                                        album
                                    )}
                                </Grid>
                            );
                        })}
                    </SlideContainer>

                    <SlideContainer>
                        {albumToShow != null ? (
                            <PhotoViewer album={albumToShow}>
                                <div style={styles.album.buttons.container}>
                                    <Button
                                        onClick={() =>
                                            this.props.viewAlbum(
                                                "prev",
                                                albumToShow
                                            )
                                        }
                                        size="small"
                                    >
                                        <ArrowBack />
                                    </Button>
                                    {/*<CircularProgressButton*/}
                                    {/*    loading={this.state.isDownloading}*/}
                                    {/*    onClick={() => this.downloadAlbum(albumToShow._id)}*/}
                                    {/*>*/}
                                    {/*    Download*/}
                                    {/*    <Icon>save</Icon>*/}
                                    {/*</CircularProgressButton>*/}
                                </div>
                            </PhotoViewer>
                        ) : (
                            <div></div>
                        )}
                    </SlideContainer>
                </SwipeableViews>
            );
        }
    }

    downloadAlbum(albumId) {
        this.setState({ isDownloading: true });
        console.log(albumId);
        // fetch() zipped pics etc...
        setTimeout(() => {
            this.setState({ isDownloading: false });
        }, 3000);
    }

    render() {
        let { loading } = this.state;
        return (
            <React.Fragment>
                {loading ? <Spinner /> : this.showGallery()}
            </React.Fragment>
        );
    }
}

const styles = {
    slides: {
        container: {
            maxWidth: "96vw",
        },
    },
    emptyList: {
        textAlign: "center",
    },
    albumThumb: {
        button: {
            container: {
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
            },
        },
    },
    album: {
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

Gallery.propTypes = {
    albumToShow: PropTypes.object,
    slideIndex: PropTypes.number,
    viewAlbum: PropTypes.func,
};

export default Gallery;
