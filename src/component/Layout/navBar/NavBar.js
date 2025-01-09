import "./navBar.css"
import {
    MdPerson,
    MdSupervisedUserCircle,
    MdLogout,
    MdHome,
    MdHomeFilled
} from "react-icons/md"
import { LiaGrinStarsSolid } from "react-icons/lia";
import { CiHome } from "react-icons/ci";
import { RiHomeSmileLine } from "react-icons/ri";
import { Link, NavLink } from "react-router-dom"
import MenuLink from "../sidebar/MenuLink"
import useAuth from "../../../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSendLogoutMutation } from "../../../fetures/auth/authApiSlice"
import {
    BsBagHeartFill,
    BsCashCoin
} from "react-icons/bs";
import {
    FaCartPlus,
    FaHouseChimney,
    FaMagnifyingGlass,
    FaWhmcs,
    FaWeixin,
    FaMoneyBillTransfer,
    FaMoneyBillTrendUp,
    FaArrowDownShortWide,
    FaAddressBook,
    FaChartColumn,
    FaCreditCard,
    FaSackDollar,
    FaEnvelopeOpenText,
    FaRegComments,
    FaArrowRightFromBracket,
    FaPlay, FaPuzzlePiece,
    FaRegCircleQuestion
} from "react-icons/fa6";
import Search from "../../search/Search"

const NavBar = () => {

    // useEffect=(()=>{

    // },[])
    const navigate = useNavigate()
    const { _id, userName, name, email, roles } = useAuth()
    const [logout, { isSuccess }] = useSendLogoutMutation()
    const [userMenu, setUserMenu] = useState(false)
    const logOutClick = () => {
        setUserMenu(!userMenu)
        logout()
        navigate("/")
    }
    const [showFixedMenu, setShowFixedMenu] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            const threshold = 100; // הגדרת סף הגלילה שבו ישתנה התפריט ל־position: fixed
            const isScrolled = window.scrollY > threshold;

            setShowFixedMenu(isScrolled);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const [openIndex, setOpenIndex] = useState(null);

    const toggleSubmenu = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="navbar">
            <div className="navbar-title">
                <div className="navbar-logo-box">
                    <div className="logoNavBar"></div>
                    <Search className="navBarSearch" placeholder={"חיפוש כללי"} />
                    <h2 className="title">SLIKA</h2>
                </div>
                {roles !== 'admin' && !userName && <div className="navbar-a-box">
                    <Link to="/login" className="products-list-add-btn">
                        התחברות
                    </Link>
                    <Link to="/regist" className="products-list-add-btn">
                        הרשמה
                    </Link></div>}
                {roles === 'admin' && <div className="admin-user">
                    <div className="sidebar-user-datails">
                        <span className="sidebar-user-username">מנהל: {name}</span>
                        {/* <span className="sidebar-user-username">{userName}</span> */}
                        {/* <span className="sidebar-user-username">{email}</span> */}
                        <span className="sidebar-user-username">roles: {roles}</span>
                    </div>
                    <img src={"/blackLogo.png"} alt="" width="50" height="50" className="sidebar-user-image" />
                </div>}
                {roles !== 'admin' && userName && <div className="navbar-menu-box">
                    {
                        userName && <div className="navbar-menu-div">
                            <MdPerson size={40} className="userMenu" onClick={() => setUserMenu(!userMenu)}></MdPerson>
                            <p>{name}</p>
                        </div>
                    }
                    {
                        userMenu && <div className="navbar-menu-box">
                            <div className="navbar-icons">
                                {/* <FaCartPlus className="btn" size={20} /> */}
                                <NavLink className="btn" to='/settings'><FaWhmcs size={20} /></NavLink>
                                <NavLink className="btn" to='/letters'><FaEnvelopeOpenText size={20} /></NavLink>
                                <NavLink className="btn" to='/logout'><FaArrowRightFromBracket size={20} onClick={logOutClick} /></NavLink>
                                {/* <MdLogout className="btn" size={20} onClick={logOutClick}>התנתקות</MdLogout> */}
                            </div></div>
                    }
                </div>}

            </div >

            {/* <Search className="navBarSearch" placeholder={"חיפוש כללי"} /> */}

            {/* </div >} */}
            <div className={`sidebar-main-menu ${showFixedMenu ? "fixed-menu" : ""}`}>
                <ul>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/'><FaHouseChimney size={25} className="icon" /> עמוד הבית</NavLink>
                    </li>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/categories/transactions'><FaAddressBook size={25} className="icon" /> לקוחות</NavLink>
                        <ul className="submenu">
                            <li>ניהול לקוחות</li>
                            <li>הוספת לקוח חדש</li>
                        </ul>
                    </li>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/categories/customerBilling'><FaSackDollar size={25} className="icon" /> הכנסות</NavLink>
                        <ul className="submenu">
                            <li>דוחות הכנסות</li>
                            <li>הפקת חשבונית</li>
                        </ul>
                    </li>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/categories/paymentRequirements'><FaMoneyBillTransfer size={25} className="icon" /> הוצאות</NavLink>
                        <ul className="submenu">
                            <li>תשלומים שוטפים</li>
                            <li>דוחות הוצאות</li>
                        </ul>
                    </li>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/categories/creditClearing'><FaCreditCard size={25} className="icon" /> סליקת אשראי</NavLink>
                        <ul className="submenu">
                            <li>חיובים שנכשלו</li>
                            <li>דוחות סליקה</li>
                        </ul>
                    </li>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/categories/standingOrders'><FaArrowDownShortWide size={25} className="icon" /> הוראות קבע</NavLink>
                        <ul className="submenu">
                            <li>הוספת הוראה חדשה</li>
                            <li>ניהול הוראות קיימות</li>
                        </ul>
                    </li>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/categories/history'><FaChartColumn size={25} className="icon" /> היסטוריה</NavLink>
                        <ul className="submenu">
                            <li>היסטוריית תשלומים</li>
                            <li>היסטוריית פעולות</li>
                        </ul>
                    </li>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/categories/services'><FaPlay size={25} className="icon" /> שירותים</NavLink>
                        <ul className="submenu">
                            <li>שירותים פעילים</li>
                            <li>הוספת שירות חדש</li>
                        </ul>
                    </li>
                    <li className="menu-item">
                        <NavLink className="nav-link" to='/categories/contact'><FaRegComments size={25} className="icon" /> צור קשר</NavLink>
                    </li>
                </ul>
            </div>

        </div >
    )
}
export default NavBar