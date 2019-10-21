import React from 'react';
import {drawerWidth, appBarHeight} from './NavBar';
import Divider from '@material-ui/core/Divider';
import PersonIcon from '@material-ui/icons/Person';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import {SocialIcon} from "react-social-icons";
import { makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import LibraryBookIcon from '@material-ui/icons/LibraryBooks';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {PAGES} from './App'

const useStyles = makeStyles(theme => ({
    toolbar: {
        height: appBarHeight
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
        maxWidth: `${appBarHeight - 5}px`
    }
}));

function Sidebar(props) {
    const classes = useStyles();

    return (
        <React.Fragment>
            <div className={classes.toolbar} style={{display: "flex", alignItems: "center", flexDirection: "row", justifyContent: "center"}}>
                <SocialIcon target="_blank" url="https://github.com/danmun" bgColor="#000000" className={classes.socialIcon}/>
                <SocialIcon target="_blank" url="https://www.instagram.com/wandering.dnm/" className={classes.socialIcon}/>
            </div>
            <Divider />

            {/* container for menu/navigation items */}
            <Grid container spacing={0} direction="row">
                <Grid item xs={12}>
                    <List>
                        <ListItem button onClick={() => props.setPageToShow(PAGES.FEED)}>
                            <ListItemIcon><LibraryBookIcon /></ListItemIcon>
                            <ListItemText primary="Blog" />
                        </ListItem>

                        <ListItem button onClick={() => props.setPageToShow(PAGES.GALLERY)}>
                            <ListItemIcon><PhotoLibraryIcon /></ListItemIcon>
                            <ListItemText primary="Gallery" />
                        </ListItem>

                        <ListItem button onClick={() => props.setPageToShow(PAGES.ABOUT)}>
                            <ListItemIcon><HelpIcon /></ListItemIcon>
                            <ListItemText primary="About" />
                        </ListItem>
                    </List>
                </Grid>
            </Grid>

            <Divider />

            <br />

            <Grid container alignItems="center" justify="center" spacing={0} direction="column" >
                {/* xs is NOT THE RIGHT WAY to center the items, but `alignItems` and `justify` don't work! */}
                <Grid item xs={12}>
                    <Avatar className={classes.bigAvatar} onClick={() => props.setPageToShow(PAGES.LOGIN)}><PersonIcon/></Avatar>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default Sidebar;