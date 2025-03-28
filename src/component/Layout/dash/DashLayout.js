import { Outlet } from "react-router-dom"
import NavBar from "../navBar/NavBar"
import Footer from "../footer/Footer"
import "./dashLayout.css"
import SideBar from "../sidebar/SideBar"
import{ MdSearch}from "react-icons/md"
import HomeMain from "../../../fetures/home/HomeMain"

const DashLayout=()=>{

    // return(
    //     <div className="container">
    //         <div className="menu">
    //             {/* <SideBar/> */}
    //         </div>
    //         <div className="content">
    //         {/* <div className="navbar-search">
    //                 <MdSearch/>
    //                 <input type="text" placeholder="Search..." className="navbar-input"/>
    //             </div>
    //             <HomeMain/> */}
    //             <Outlet/>
    //             {/* <Footer/> */}
    //         </div>
    //     </div>
    // )
    return (
        <div className="page">
             <header>
                <NavBar />
            </header>
            <main>
                <div className="content">
                    <Outlet />
                </div>
                <aside className="menu">
                    <SideBar/>
                </aside>
            </main>
        </div>
    );
}
export default DashLayout