import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SwipeableViews from 'react-swipeable-views';
import Album from "./Album";
import PhotoViewer from "./PhotoViewer"
import SlideContainer from "./SlideContainer";
import ArrowBack from '@material-ui/icons/ArrowBack';
import Spinner from "./Spinner";
import CircularProgressButton from "./CircularProgressButton";
import {Icon} from "@material-ui/core";

const springConfig = {
    duration: "1s",
    easeFunction: "cubic-bezier(0.1, 0.35, 0.2, 1)",
    delay: "0.1s", // gives enough time for the user to see the `Read Post` button's animation
}


class Gallery extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            loading: true,
            albums: []
        }
        
        this.createAlbum = this.createAlbum.bind(this);
        this.fetchGallery = this.fetchGallery.bind(this);
        this.showGallery = this.showGallery.bind(this);
        this.downloadAlbum = this.downloadAlbum.bind(this);
    }
    
    componentDidMount() {
        this.fetchGallery()
    }

    fetchGallery(){
        fetch(`/gallery`)
        // We get the API response and receive data in JSON format...
            .then(response => response.json())
            // return response.json() would go here but we already did that in the args above
            .then(json =>
                this.setState({
                    albums: json,
                    loading: false
                }) // after updating state, signal end of refresh to main controller (App.js)
            )
    }

    createAlbum(viewAlbum, album){
        return(
            <Album viewAlbum={viewAlbum} album={album}>
                <div style={{width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    <Button onClick={() => viewAlbum("next", album)} size="small">
                        Explore
                    </Button>
                </div>
            </Album>);
    }

    showGallery(){
        let albums = this.state.albums
        let albumToShow = this.props.albumToShow
        if(albums.length === 0){
            return(
                <React.Fragment>
                    <div style={{textAlign: "center"}}>
                        There are no albums to display.
                    </div>
                </React.Fragment>)
        }else{
            return(
                <SwipeableViews disabled springConfig={springConfig} index={this.props.slideIndex} style={{maxWidth: "96vw"}}>
                    <SlideContainer>
                        {albums.map((album, albumi) => {
                            return <Grid key={album.thumb} item>{this.createAlbum(this.props.viewAlbum, album)}</Grid>
                        })}
                    </SlideContainer>

                    <SlideContainer>
                        {albumToShow != null ?
                            <PhotoViewer album={albumToShow}>
                                <div style={{width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                                    <Button onClick={() => this.props.viewAlbum("prev", albumToShow)} size="small">
                                        <ArrowBack/>
                                    </Button>
                                    <CircularProgressButton onClick={(setDone) => this.downloadAlbum(albumToShow._id, setDone)}>
                                        Download
                                        <Icon>save</Icon>
                                    </CircularProgressButton>
                                </div>
                            </PhotoViewer>
                            :
                            <div></div>
                        }
                    </SlideContainer>
                </SwipeableViews>
            )
        }
    }
    
    downloadAlbum(albumId, setDone){
        console.log(albumId)
        // fetch()
        setTimeout(() => setDone(), 3000);
    }
    
    render(){
        let {loading} = this.state
        return(
            <React.Fragment>
                {loading ? <Spinner/> : this.showGallery()}
            </React.Fragment>)
    }
}

export default Gallery;
