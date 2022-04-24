import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";

function Album(props) {
    const classes = useStyles();
    let album = props.album;
    return (
        <Card className={classes.card}>
            <CardActionArea>
                <CardMedia
                    className={classes.media}
                    image={album.thumb}
                    title="Title"
                />
            </CardActionArea>

            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    {album.title}
                    <br />
                    <Typography color="textSecondary">
                        {dateToStr(album.createdOn)}
                    </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {album.description}
                </Typography>
            </CardContent>

            <CardActions>{props.children}</CardActions>
        </Card>
    );
}

function dateToStr(date){
    return new Date(date).toLocaleString("ja-JP");
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

Album.propTypes = {
    album: PropTypes.object,
};

export default Album;
