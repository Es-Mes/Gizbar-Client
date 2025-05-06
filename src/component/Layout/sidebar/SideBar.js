import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHouseChimney,
  FaAddressBook,
  FaSackDollar,
  FaMoneyBillTransfer,
  FaCreditCard,
  FaArrowDownShortWide,
  FaChartColumn,
  FaPlay,
  FaRegComments,
} from "react-icons/fa6";
import "./sidebar.css";

const Sidebar = ({ closeMenu }) => {
  const [openIndex, setOpenIndex] = useState(null); // משתנה לניהול תפריטים פתוחים
  const [activeIndex, setActiveIndex] = useState(0); // משתנה לניהול פריט פעיל

  const menuItems = [
    {
      title: "לקוחות",
      icon: FaAddressBook,
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
      link: "/dash/transactions/customer",
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
    {
      title: "צור קשר",
      icon: FaRegComments,
      link: "/dash/UnderConstruction"
    },

  ];


  return (
    <div className="sidebar-main-menu">
          <NavLink className="nav-link" activeClassName="active" to="/dash" end
           onClick={() => {
            if (closeMenu) closeMenu(); // סוגר תפריט במסך קטן
          }}>
          {React.createElement(FaHouseChimney, { size: 25, className: "icon" })} עמוד הבית
        </NavLink>
         {menuItems.map((menu, index) => (
          <NavLink className="nav-link" activeClassName="active" to={menu.link}
          onClick={() => {
            if (closeMenu) closeMenu(); // סוגר תפריט במסך קטן
          }}>
          {React.createElement(menu.icon, { size: 25, className: "icon" })} {menu.title}
        </NavLink>
        ))} 
    </div>
  );
};

export default Sidebar;
