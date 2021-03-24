import React from 'react';
import Lightbox from 'react-image-lightbox';
import Grid from '@material-ui/core/Grid';
import Photo from "./Photo";
import 'react-image-lightbox/style.css';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {withRouter} from 'react-router-dom'
import {fetchAlbum} from "./api/gallery";
import Spinner from "./Spinner";

const IMG_URL_BASE = "/gallery/album?img="

// TODO: it might be bad practice to rely on props in the render of a class based component as props
//  might not be up to date...
class PhotoViewer extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            album: null,
            photoIndex: 0,
            isOpen: false,
        }

        this.toggleLightbox = this.toggleLightbox.bind(this);
        this.createLightbox = this.createLightbox.bind(this);
        this.createAlbumTile = this.createAlbumTile.bind(this);
    }

    componentDidMount() {
        if(!this.props.album){
            fetchAlbum(this.props.match.params.id).then(json => {
                if(json.error){
                    this.setState({error: json.error})
                }else{
                    this.setState({album: json})
                }
            })
        }
    }

    initAlbum(album){
        if(!album) return null
        return this.createLightbox(album.photos, this.state.photoIndex)
    }
    
    render(){
        let album = this.props.album ? this.props.album : this.state.album
        if(!album){
            return(<Spinner/>)
        }

        const viewerComponent = this.initAlbum(album)
        const {isOpen} = this.state

        return(
            <React.Fragment>
                <Grid item>{isOpen && viewerComponent}</Grid>
                <Grid item>{this.createAlbumTile(album, this.props.children)}</Grid>
                {album.photos.map((photo, photoi) => {
                    return <Grid key={photo} item>
                                <Photo photo={photo} showPhoto={() => this.toggleLightbox(photoi)}/>
                           </Grid>
                })}
            </React.Fragment>
        );
    }

    createAlbumTile(album, children){
        return(
            <Card style={{
                    maxWidth: 350,
                    minWidth: 280,
                    height: 280,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"}}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {album.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {album.description}
                    </Typography>
                </CardContent>

                <CardActions>
                    {children}
                </CardActions>
            </Card>
        );
    }

    createLightbox(images, photoIndex){
        return(
            <Lightbox
                mainSrc={images[photoIndex]}
                nextSrc={images[(photoIndex + 1) % images.length]}
                prevSrc={images[(photoIndex + images.length - 1) % images.length]}
                onCloseRequest={() => this.toggleLightbox(0)}
                onMovePrevRequest={() => this.updateStateAndUrl("prev", images, photoIndex)}
                onMoveNextRequest={() => this.updateStateAndUrl("next", images, photoIndex)}
            />);
    }

    updateStateAndUrl(newDirection, images, index){
        let photoIndex = index % images.length
        if(newDirection === "prev"){
            photoIndex = (index + images.length - 1) % images.length
        }else if(newDirection === "next"){
            photoIndex = (index + 1) % images.length
        }
        this.setState({
            photoIndex: photoIndex
        })
        // we can push just the id here since the parent will already be the album ID
        // gallery/album/<albumId>/<photoIndex>
        this.props.history.push(`${photoIndex}`)
    }

    toggleLightbox(id){
        if(this.state.isOpen){
            this.setState({isOpen: false, photoIndex: id})
            // TODO: this will be problematic once we implement external visits for image itself
            //  (see notes on goBack() in App.js)
            this.props.history.goBack()
        }else{
            // .push appends the given path relative to the parent route
            // e.g. current route /gallery/album/123/ then parent route is /123/
            //      then .push("5") will take us to /gallery/album/123/5
            // if trailing slash is missing from the URL, the parent route is considered to be the next route ending in a slash
            // e.g. current route /gallery/album/123 then parent route is /album/
            //      then .push("5") will take us to /gallery/album/5
            // solution (A) React: always push the full path instead of just the ID of the image (/gallery/album/123/5)
            // solution (B) Node: push only ID of image here, but redirect non-trailing slash requests to trailing slash page from node (via 301)
            let album = this.props.album ? this.props.album : this.state.album
            // solution (A)
            const path = `/gallery/album/${album._id}/${id}`
            this.setState({isOpen: true, photoIndex: id})
            this.props.history.push(path)
        }
    }
}

export default withRouter(PhotoViewer);