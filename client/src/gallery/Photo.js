import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import PropTypes from "prop-types";

function Photo(props) {
    const classes = useStyles();

    return (
        <Card className={classes.card} onClick={props.showPhoto}>
            <CardActionArea>
                <CardMedia
                    className={classes.media}
                    image={props.photo}
                    title="Title"
                />
            </CardActionArea>
        </Card>
    );
}

const useStyles = makeStyles({
    card: {
        maxWidth: 350,
        minWidth: 280,
    },

    media: {
        height: 280,
    },
});

Photo.propTypes = {
    showPhoto: PropTypes.func,
    photo: PropTypes.object,
};

export default Photo;
