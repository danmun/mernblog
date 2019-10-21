import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import {gallery} from "./data";
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';


function PhotoPreviewPane(props) {
    const [photos, setPhotos] = useState(gallery.albums[1].photos)
    const [removedPhotos, setRemovedPhotos] = useState([])

    let updatePhotos = function(photoi){

        let removed = photos.splice(photoi, 1)
        removedPhotos.push(removed)

        setRemovedPhotos([...removedPhotos])
        setPhotos([...photos])
        // as per https://stackoverflow.com/a/56266640 (if just [photos] react sees no change in the object])
    }

    return(
        <React.Fragment>
            <Grid item xs style={{width: "100%"}}>
                {/*<div style={{border: "1px solid lightGrey", padding: "15px", minHeight: "40vh"}}>*/}
                    <Grid container
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justify="center"
                          style={{
                              // padding: "15px",
                              minHeight: "50vh",
                              maxHeight: "40vh",
                              overflowY: "scroll",
                              border: "1px solid lightGrey"}}>

                        {photos.map((photo, photoi) => {
                            return PhotoThumb(photo, photoi, updatePhotos)
                        })}
                        {photos.length === 0 && <Grid item>{"There are no more photos left in this album."}</Grid>}

                    </Grid>
                {/*</div>*/}
            </Grid>
        </React.Fragment>)
}

function PhotoThumb(photo, photoi, updatePhotos){
    // url('https://unsplash.it/400/500.jpg')
    let style = {
        backgroundImage: "url(" + photo + ")",
        height: "90px",
        backgroundPosition: "50% 50%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",

        padding: "80px",
        margin: "10px 10px 10px 10px"
    }

    return(
        <Grid item key={photo + "_" + photoi} align="center" xs={3} style={style}>
                <IconButton
                    color="secondary"
                    style={{
                        background: "rgba(255, 255, 255, 0.6)",
                        position: "relative",
                        top: "0",
                        right: "0"
                        // background: "red",
                        // top: "12px",
                        // margin: "5px"
                    }}
                    // edge="start"
                    onClick={() => updatePhotos(photoi)}
                    // className={classes.menuButton}
                >
                    <CancelIcon/>
                </IconButton>
        </Grid>
    );

}

export default PhotoPreviewPane;