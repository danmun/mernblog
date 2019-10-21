import React from 'react';
import Lightbox from 'react-image-lightbox';
import Grid from '@material-ui/core/Grid';
import Photo from "./Photo";
import 'react-image-lightbox/style.css';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';


// TODO: it might be bad practice to rely on props in the render of a class based component as props
//  might not be up to date...
class PhotoViewer extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            photoIndex: 0,
            isOpen: false,
        }

        this.toggleLightbox = this.toggleLightbox.bind(this);
        this.createLightbox = this.createLightbox.bind(this);
        this.createAlbumTile = this.createAlbumTile.bind(this);
    }
    
    render(){
        let album = this.props.album
        let images = album.photos
        const { photoIndex, isOpen } = this.state;

        let viewer = this.createLightbox(images, photoIndex)

        return(
            <React.Fragment>
                <Grid item>{isOpen && viewer}</Grid>
                <Grid item>{this.createAlbumTile(album, this.props.children)}</Grid>
                {images.map((photo, photoi) => {
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
                onCloseRequest={() => this.setState({ isOpen: false })}
                onMovePrevRequest={() =>
                    this.setState({
                        photoIndex: (photoIndex + images.length - 1) % images.length,
                    })
                }
                onMoveNextRequest={() =>
                    this.setState({
                        photoIndex: (photoIndex + 1) % images.length,
                    })
                }
            />);
    }

    toggleLightbox(id){
        if(this.state.isOpen){
            return;
        }
        this.setState({isOpen: true, photoIndex: id})
    }
}

export default PhotoViewer;