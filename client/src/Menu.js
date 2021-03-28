import React, {useState} from 'react';
import NavBar from "./NavBar";
import ResponsiveDrawer from "./ResponsiveDrawer";
import Sidebar from "./Sidebar";

//props: adminNav
function Menu(props) {
    const [mobile, setMobile] = useState(false)
    const {adminNav} = props

    const handleNav = (page) => {
        setMobile(false)
        props.navigator(page)
    }

    return (
        <React.Fragment>
            <NavBar handleDrawerToggle={() => setMobile(true)}>
                {adminNav && adminNav}
            </NavBar>

            <ResponsiveDrawer mobileOpen={mobile} dispose={() => setMobile(false)}>
                <Sidebar navigator={handleNav}/>
            </ResponsiveDrawer>
        </React.Fragment>
    );
}

export default Menu;