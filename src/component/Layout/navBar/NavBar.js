import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  MdPerson,
  MdLogout,
} from "react-icons/md";
import { FaWhmcs, FaEnvelopeOpenText, FaArrowRightFromBracket } from "react-icons/fa6";
import Search from "../../search/Search";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useSendLogoutMutation } from "../../../fetures/auth/authApiSlice";
import "./navBar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const { _id, phone, first_name, email, roles } = useAuth();
  const [logout, { isSuccess }] = useSendLogoutMutation();
  const [userMenu, setUserMenu] = useState(false);

  const logOutClick = () => {
    setUserMenu(!userMenu);
    logout();
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/");
    }
  }, [isSuccess, navigate]);

  return (
    <div className="navbar">
      <div className="navbar-title">
        <div className="navbar-logo-box">
          {/* <div className="logoNavBar"></div> */}
          {/* <Search className="navBarSearch" placeholder={"חיפוש כללי"} /> */}
          <h2 className="title">GIZBAR</h2>
          <h2>שלום {first_name || "אורח"}</h2>
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
            <div className="sidebar-user-datails">
              <span className="sidebar-user-username">מנהל: {first_name}</span>
              <span className="sidebar-user-username">roles: {roles}</span>
            </div>
            <img
              src={"/blackLogo.png"}
              alt=""
              width="50"
              height="50"
              className="sidebar-user-image"
            />
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
              <NavLink className="navbar-nav-link" activClassName="active" to="settings/personal">
                <MdPerson className="fa-icon" size={20} />
              </NavLink>
              {/* <NavLink className="btn" to="/letters"> */}
              <NavLink className="nav-link" to="/dash/UnderConstruction">
                <FaEnvelopeOpenText className="fa-icon" size={20} />
              </NavLink>
              <div className="btn" onClick={logOutClick}>
                <FaArrowRightFromBracket className="fa-icon" size={20} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
