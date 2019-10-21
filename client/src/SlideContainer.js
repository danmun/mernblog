import React from 'react';
import Grid from '@material-ui/core/Grid';


function SlideContainer(props) {
    return (
        <div style={{padding: 5,  maxWidth: "100vw", maxHeight: "95vh"}}> {/* this padding should match with padding in app.js' swipeableview */}
            <Grid container spacing={1} direction="row" alignItems={"center"} justify={"center"}>
                {props.children}
            </Grid>
        </div>
    );
}

export default SlideContainer;