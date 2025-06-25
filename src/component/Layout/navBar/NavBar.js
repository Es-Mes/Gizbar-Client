import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  MdPerson,
  MdLogout,
} from "react-icons/md";
import { FaBars } from "react-icons/fa";

import { FaWhmcs, FaEnvelopeOpenText, FaArrowRightFromBracket } from "react-icons/fa6";
import Search from "../../search/Search";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useSendLogoutMutation } from "../../../fetures/auth/authApiSlice";
import "./navBar.css";

const NavBar = ({ toggleMenu }) => {
  const navigate = useNavigate();
  const { _id, phone, first_name,last_name, email, roles } = useAuth();
  const [logout, { isSuccess }] = useSendLogoutMutation();
  const [userMenu, setUserMenu] = useState(false);

  const logOutClick = () => {
    setUserMenu(!userMenu);
    logout();
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/login");
    }
  }, [isSuccess, navigate]);

  const today = new Date().toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
 });

  return (
    <div className="navbar">
      <div className="navbar-title">
      <button className=" menu-button menuButton" onClick={toggleMenu}>
        <FaBars size={24} />
      </button>
        <div className="navbar-logo-box">
          {/* <div className="logoNavBar"></div> */}
          {/* <Search className="navBarSearch" placeholder={"חיפוש כללי"} /> */}
          <h2 className="title">GIZBAR</h2>
          <h2>{roles === "admin" && "ממשק לניהול המערכת |"} שלום וברכה ל{first_name || "אורח"} | {today}</h2>
          {/* <h2>{today} - מה קורה החודש?</h2> */}

        </div>

        {roles !== "admin" && !phone && (
          <div className="navbar-a-box">
            <Link to="/login" className="nav-bar-btn">
              התחברות
            </Link>
            <Link to="/regist" className="nav-bar-btn">
              הרשמה
            </Link>
          </div>
        )}

        {roles === "admin" && (
          <div className="admin-user">
            <div className="navbar-icons">
              <NavLink className="navbar-nav-link  icon-tooltip" activClassName="active" to="settings/personal">
                <MdPerson className="fa-icon" size={20} /><p className="tooltip-text">ניהול חשבון</p><p className="display-in-wide">ניהול חשבון</p>
              </NavLink>
              {/* <NavLink className="btn" to="/letters"> */}              
              <div className="btn  icon-tooltip" onClick={logOutClick}>
                <FaArrowRightFromBracket className="fa-icon" size={20} /><p className="tooltip-text">יציאה</p><p  className="display-in-wide">יציאה</p>
              </div>
            </div>
          </div>
        )}

        {roles !== "admin" && phone && (
          <div className="navbar-menu-box">
            {/* {phone && (
              <div className="navbar-menu-div">
                <MdPerson
                  size={40}
                  className="userMenu"
                  onClick={() => setUserMenu(!userMenu)}
                ></MdPerson>
                <p>{first_name}</p>
              </div>
            )} */}
            <div className="navbar-icons">
              <NavLink className="navbar-nav-link  icon-tooltip" activClassName="active" to="settings/personal">
                <MdPerson className="fa-icon" size={20} /><p className="tooltip-text">ניהול חשבון</p><p className="display-in-wide">ניהול חשבון</p>
              </NavLink>
              {/* <NavLink className="btn" to="/letters"> */}
              <NavLink className="nav-link  icon-tooltip">
                <FaEnvelopeOpenText className="fa-icon" size={20}  />
                {/* <p className="tooltip-text">ההודעות שלי</p> */}
                <p className="tooltip-text disabled">לא פעיל, בפיתוח...</p>
                <p className="display-in-wide">ההודעות שלי</p>
              </NavLink>
              <div className="btn  icon-tooltip" onClick={logOutClick}>
                <FaArrowRightFromBracket className="fa-icon" size={20} /><p className="tooltip-text">יציאה</p><p  className="display-in-wide">יציאה</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
