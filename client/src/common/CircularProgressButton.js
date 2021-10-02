import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { Button, CircularProgress } from "@material-ui/core";
import PropTypes from "prop-types";

function CircularProgressButton(props) {
    const classes = useStyles();
    const { loading, disabled, className, onClick } = props;

    const handleButtonClick = (event) => {
        event.preventDefault();
        onClick();
    };

    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <Button
                    {...props}
                    disabled={loading || disabled}
                    className={`${classes.button} ${className}`} // ${props.className}
                    onClick={handleButtonClick}
                />
                {/* size=24 comes from Mui official docs for setting up a button with a spinner over it,
                    this size is tightly coupled to other styling, so don't touch it */}
                {loading && (
                    <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                    />
                )}
            </div>
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        display: "flex",
        alignItems: "center",
    },
    wrapper: {
        minWidth: "100%",
        position: "relative",
    },
    button: {
        minWidth: "100%",
    },
    buttonProgress: {
        width: "100%",
        color: green[500],
        position: "absolute",
        // place vertically and horizontally in center of rectangle box
        // numbers came from official Mui docs, https://v4.mui.com/components/progress/
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
}));

CircularProgressButton.propTypes = {
    onClick: PropTypes.func,
    loading: PropTypes.bool,
};

export default CircularProgressButton;
