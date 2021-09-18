import React from "react";
import { CircularProgress } from "@material-ui/core";

function Spinner(props) {
    return (
        <React.Fragment>
            <div style={styles.container}>
                <CircularProgress color="secondary" />
            </div>
        </React.Fragment>
    );
}

const styles = {
    container: {
        textAlign: "center",
    },
};

export default Spinner;
