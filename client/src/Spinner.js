import React from "react";
import {CircularProgress} from "@material-ui/core";

function Spinner(props) {
    return(
        <React.Fragment>
            <div style={{textAlign: "center"}}>
                <CircularProgress color="secondary"/>
            </div>
        </React.Fragment>
    )
}

export default Spinner;
