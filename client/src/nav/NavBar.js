import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/VerticalSplit";
import Toolbar from "@material-ui/core/Toolbar";
import React from "react";
import { makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";

export const drawerWidth = 200;
export const appBarHeight = 35;

function NavBar(props) {
    const classes = useStyles();
    return (
        // if we move the container div (add/del buttons) outside the toolbar, it will use flex, otherwise it doesnt...
        <AppBar className={classes.appBar}>
            <Toolbar className={classes.toolBar}>
                {/* elements in this div will appear on the left side of the navbar*/}
                <div>
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={props.handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                </div>

                {/* elements here will appear on the right side of the navbar*/}
                <div>{props.children}</div>
            </Toolbar>
        </AppBar>
    );
}

const useStyles = makeStyles((theme) => ({
    toolBar: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up("sm")]: {
            width: `calc(100% - ${drawerWidth}px)`, // or 100%
        },
        height: appBarHeight,
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        background: "white",
    },
    menuButton: {
        [theme.breakpoints.up("sm")]: {
            display: "none",
        },
        padding: "7px",
        marginLeft: "0px",
        "-moz-transform": "scale(-1, 1)",
        "-webkit-transform": "scale(-1, 1)",
        "-o-transform": "scale(-1, 1)",
        "-ms-transform": "scale(-1, 1)",
        transform: "scale(-1, 1)",
    },
}));

NavBar.propTypes = {
    handleDrawerToggle: PropTypes.func,
    children: PropTypes.any,
};

export default NavBar;
