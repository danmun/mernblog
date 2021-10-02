import React, { useState } from "react";
import NavBar from "./NavBar";
import ResponsiveDrawer from "./ResponsiveDrawer";
import Sidebar from "./Sidebar";
import IconButton from "@material-ui/core/IconButton";
import AddPostIcon from "@material-ui/icons/AddCircle";
import AddAlbumIcon from "@material-ui/icons/AddPhotoAlternate";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PhonelinkLock from "@material-ui/icons/PhonelinkLock";
import { logout } from "../api/auth";
import PropTypes from "prop-types";

function Menu(props) {
    const [mobile, setMobile] = useState(false);
    const { createPost, createAlbum, onLogout, mfaSetup } = props;

    const handleNav = (page) => {
        setMobile(false);
        props.navigator(page);
    };

    const doLogout = () => {
        logout().then((success) => {
            if (success) {
                onLogout();
            } else {
                // todo: error during logout
            }
        });
    };

    return (
        <React.Fragment>
            <NavBar handleDrawerToggle={() => setMobile(true)}>
                <React.Fragment>
                    {createPost && (
                        <IconButton
                            aria-label="open drawer"
                            edge="start"
                            onClick={createPost}
                            style={styles.colors.addPost}
                        >
                            <AddPostIcon />
                        </IconButton>
                    )}
                    {createAlbum && (
                        <IconButton
                            aria-label="open drawer"
                            edge="start"
                            onClick={createAlbum}
                            style={styles.colors.addAlbum}
                        >
                            <AddAlbumIcon />
                        </IconButton>
                    )}
                    {mfaSetup && (
                        <IconButton
                            aria-label="open drawer"
                            edge="start"
                            onClick={mfaSetup}
                            style={styles.colors.logout}
                        >
                            <PhonelinkLock />
                        </IconButton>
                    )}
                    {onLogout && (
                        <IconButton
                            aria-label="open drawer"
                            edge="start"
                            onClick={doLogout}
                            style={styles.colors.logout}
                        >
                            <ExitToAppIcon />
                        </IconButton>
                    )}
                </React.Fragment>
            </NavBar>

            <ResponsiveDrawer
                mobileOpen={mobile}
                dispose={() => setMobile(false)}
            >
                <Sidebar navigator={handleNav} />
            </ResponsiveDrawer>
        </React.Fragment>
    );
}

const styles = {
    colors: {
        addPost: {
            color: "green",
        },
        addAlbum: {
            color: "green",
        },
        logout: {
            color: "black",
        },
    },
};

Menu.propTypes = {
    createPost: PropTypes.func,
    createAlbum: PropTypes.func,
    onLogout: PropTypes.func,
    navigator: PropTypes.func,
    mfaSetup: PropTypes.func,
};

export default Menu;
