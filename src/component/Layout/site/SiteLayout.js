// import {Outlet} from "react-router-dom"
// import NavBar from "../navBar/NavBar"
// import Footer from "../footer/Footer"
// const SiteLayout=()=>{
//     return(
//         <div className="page">
//     <header><NavBar /></header>
//     <main>
//         <Outlet />
//         {/* <Footer/> */}
//     </main>
// </div>
//     )
// }
// export default SiteLayout

import { Outlet } from "react-router-dom";
import NavBar from "../navBar/NavBar";
import Sidebar from "../sidebar/SideBar";

const SiteLayout = () => {
    return (
        <div className="page">

            <header>
                <NavBar />
            </header>
            <Outlet />
        </div>
    );
};

export default SiteLayout;
