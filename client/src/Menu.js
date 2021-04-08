import React, {useState} from 'react';
import NavBar from "./NavBar";
import ResponsiveDrawer from "./ResponsiveDrawer";
import Sidebar from "./Sidebar";
import IconButton from "@material-ui/core/IconButton";
import AddPostIcon from "@material-ui/icons/AddCircle";
import AddAlbumIcon from "@material-ui/icons/AddPhotoAlternate";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

//props: adminNav
function Menu(props) {
    const [mobile, setMobile] = useState(false)
    const {createPost, createAlbum, logout} = props

    const handleNav = (page) => {
        setMobile(false)
        props.navigator(page)
    }

    return (
        <React.Fragment>
            <NavBar handleDrawerToggle={() => setMobile(true)}>
                <React.Fragment>
                    {createPost &&
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={createPost}
                        style={{color: "green"}}
                    >
                        <AddPostIcon/>
                    </IconButton>
                    }
                    {createAlbum &&
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={createAlbum}
                        style={{color: "green"}}
                    >
                        <AddAlbumIcon />
                    </IconButton>
                    }
                    {logout &&
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={logout}
                        style={{color: "black"}}
                    >
                        <ExitToAppIcon />
                    </IconButton>
                    }
                </React.Fragment>
            </NavBar>

            <ResponsiveDrawer mobileOpen={mobile} dispose={() => setMobile(false)}>
                <Sidebar navigator={handleNav}/>
            </ResponsiveDrawer>
        </React.Fragment>
    );
}

export default Menu;