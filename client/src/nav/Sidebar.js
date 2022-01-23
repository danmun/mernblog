import React from "react";
import { withRouter } from "react-router-dom";
import { drawerWidth, appBarHeight } from "./NavBar";
import PersonIcon from "@material-ui/icons/Person";
import { SocialIcon } from "react-social-icons";
import { makeStyles } from "@material-ui/core/styles";
import HelpIcon from "@material-ui/icons/Help";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import LibraryBookIcon from "@material-ui/icons/LibraryBooks";
import { PAGES } from "../App";
import PropTypes from "prop-types";
import {
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Grid,
} from "@material-ui/core";
import LastSeen from "../common/LastSeen";

function Sidebar(props) {
    const classes = useStyles();
    const { navigator } = props;

    return (
        <div className={classes.sidebar}>
            <div className={classes.toolbar}>
                <SocialIcon
                    target="_blank"
                    url="https://github.com/danmun"
                    bgColor="#000000"
                    className={classes.socialIcon}
                />
                <SocialIcon target="_blank" url="https://twitter.com/wanderingdnm" className={classes.socialIcon}/>
                {/*<SocialIcon target="_blank" url="https://www.instagram.com/wandering.dnm/" className={classes.socialIcon}/>*/}
            </div>
            <Divider />

            {/* container for menu/navigation items */}
            <Grid container spacing={0} direction="row">
                <Grid item xs={12}>
                    <List>
                        <ListItem button onClick={() => navigator(PAGES.FEED)}>
                            <ListItemIcon>
                                <LibraryBookIcon />
                            </ListItemIcon>
                            <ListItemText primary="Blog" />
                        </ListItem>

                        <ListItem
                            button
                            onClick={() => navigator(PAGES.GALLERY)}
                        >
                            <ListItemIcon>
                                <PhotoLibraryIcon />
                            </ListItemIcon>
                            <ListItemText primary="Gallery" />
                        </ListItem>

                        <ListItem button onClick={() => navigator(PAGES.ABOUT)}>
                            <ListItemIcon>
                                <HelpIcon />
                            </ListItemIcon>
                            <ListItemText primary="About" />
                        </ListItem>
                    </List>
                </Grid>
            </Grid>

            <Divider />

            <br />

            <Grid
                container
                alignItems="center"
                justify="center"
                spacing={0}
                direction="column"
            >
                {/* xs is NOT THE RIGHT WAY to center the items, but `alignItems` and `justify` don't work! */}
                <Grid item xs={12}>
                    <Avatar
                        className={classes.bigAvatar}
                        onClick={() => navigator(PAGES.LOGIN)}
                    >
                        <PersonIcon />
                    </Avatar>
                </Grid>
                <div className={classes.lastSeen}>
                    <LastSeen />
                </div>
            </Grid>
        </div>
    );
}

const styles = (theme) => ({
    toolbar: {
        height: appBarHeight,
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    sidebar: {
        height: "100%",
    },
    lastSeen: {
        position: "absolute",
        bottom: "20px",
        // enable the below to align text to left, though it will no longer be centered
        // paddingLeft: "10px",
        // width: "100%"
    },
    drawerPaper: {
        width: drawerWidth,
    },
    bigAvatar: {
        width: 100,
        height: 100,
    },
    socialIcon: {
        maxHeight: `${appBarHeight - 5}px`,
        maxWidth: `${appBarHeight - 5}px`,
    },
});

const useStyles = makeStyles(styles);

Sidebar.propTypes = {
    navigator: PropTypes.func,
};

export default withRouter(Sidebar);
