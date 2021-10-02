import React from "react";
import { drawerWidth } from "./NavBar";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import PropTypes from "prop-types";

function ResponsiveDrawer(props) {
    const { container } = props;
    const classes = useStyles();
    const theme = useTheme();
    const drawerClasses = {
        paper: classes.drawerPaper,
    };
    const drawerProps = {
        keepMounted: true, // Better open performance on mobile.
    };

    return (
        // original z-index is 1200 for the Drawer, must be lowered for the lightbox to be fully visible
        <div>
            <nav className={classes.drawer} aria-label="mailbox folders">
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Hidden smUp implementation="css">
                    <Drawer
                        container={container}
                        variant="temporary"
                        anchor={theme.direction === "rtl" ? "right" : "left"}
                        open={props.mobileOpen}
                        onClose={props.dispose}
                        classes={drawerClasses}
                        ModalProps={drawerProps}
                    >
                        {props.children}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer classes={drawerClasses} variant="permanent" open>
                        {props.children}
                    </Drawer>
                </Hidden>
            </nav>
        </div>
    );
}

const styles = (theme) => ({
    drawer: {
        [theme.breakpoints.up("sm")]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    drawerPaper: {
        width: drawerWidth,
    },
});

const useStyles = makeStyles(styles);

ResponsiveDrawer.propTypes = {
    mobileOpen: PropTypes.bool,
    dispose: PropTypes.func,
    children: PropTypes.any,
};
export default ResponsiveDrawer;
