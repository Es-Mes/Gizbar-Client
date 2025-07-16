import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHouseChimney,
  FaAddressBook,
  FaSackDollar,
  FaMoneyBillTransfer,
  FaCreditCard,
  FaPlay,
  FaRegComments,
  FaUsers,
} from "react-icons/fa6";
import "./sidebar.css";
import useAuth from "../../../hooks/useAuth";

const Sidebar = ({ closeMenu }) => {
  const { roles, paymentType } = useAuth()
  console.log("paymentType", paymentType);

  const menuItems = [
    // {
    //   title: "משתמשים",
    //   icon: FaAddressBook,
    //   link: "/dash/agents",
    // },

    {
      title: "לקוחות",
      icon: FaUsers,
      link: "/dash/customers",
    },
    {
      title: "הכנסות",
      icon: FaSackDollar,
      link: "/dash/transactions/income",

    },
    {
      title: "הוצאות",
      icon: FaMoneyBillTransfer,
      link: "/dash/transactions/expense",
    },
    {
      title: "סליקת אשראי",
      icon: FaCreditCard,
      link: "/dash/CreditPay",
    },
    // {
    //   title: "הוראות קבע",
    //   icon: FaArrowDownShortWide,
    //   link: "/dash/UnderConstruction",
    // },
    // {
    //   title: "היסטוריה",
    //   icon: FaChartColumn,
    //   link: "/dash/UnderConstruction",
    // },
    {
      title: "שירותים",
      icon: FaPlay,
      link: "/dash/services",
    },
    // {
    //   title: "צור קשר",
    //   icon: FaRegComments,
    //   link: "/dash/UnderConstruction"
    // },

  ];


  return (
    <div className="sidebar-main-menu">
      <NavLink className="nav-link" activeClassName="active" to="/dash" end
        onClick={() => {
          if (closeMenu) closeMenu(); // סוגר תפריט במסך קטן
        }}>
        {React.createElement(FaHouseChimney, { size: 25, className: "icon" })} עמוד הבית
      </NavLink>
      {roles === "admin" && <NavLink className="nav-link" activeClassName="active" to={"/dash/agents"}
        onClick={() => {
          if (closeMenu) closeMenu(); // סוגר תפריט במסך קטן
        }}>
        {React.createElement(FaAddressBook, { size: 25, className: "icon" })} משתמשים
      </NavLink>}
      {menuItems.map((menu, index) => {
        // בדיקה אם זה כפתור סליקת אשראי
        const isCredit = menu.link === "/dash/CreditPay";
        if (isCredit && paymentType === "none") {
          return (
            <NavLink
              key={menu.link}
              className="nav-link inDevelopment"
              activeClassName="active"
              to={menu.link}
              onClick={e => e.preventDefault()}
              tabIndex={-1}
              aria-disabled="true"
            >
              {React.createElement(menu.icon, { size: 25, className: "icon" })} {menu.title}
            </NavLink>
          );
        }
        return (
          <NavLink
            key={menu.link}
            className="nav-link"
            activeClassName="active"
            to={menu.link}
            onClick={() => {
              if (closeMenu) closeMenu();
            }}
          >
            {React.createElement(menu.icon, { size: 25, className: "icon" })} {menu.title}
          </NavLink>
        );
      })}
      {/* {menuItems.map((menu, index) => (
        <NavLink className="nav-link" activeClassName="active" to={menu.link}
          onClick={() => {
            if (closeMenu) closeMenu(); // סוגר תפריט במסך קטן
          }}>
          {React.createElement(menu.icon, { size: 25, className: "icon" })} {menu.title}
        </NavLink>
      ))} */}
      {/* לבינתיים עד שיביאו פרטיםלהתקשר עם סוכני החברה */}
      <NavLink className="nav-link inDevelopment" activeClassName="active" to={"/dash/agents"}
        onClick={(e) => e.preventDefault()}>
        {React.createElement(FaRegComments, { size: 25, className: "icon" })} צור קשר
      </NavLink>
    </div>
  );
};

export default Sidebar;
