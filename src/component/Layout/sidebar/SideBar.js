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
import "./sidebar.css"; // יצירת קובץ CSS מותאם ל-sidebar

const Sidebar = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="sidebar-main-menu">
      <ul>
        <li className="menu-item">
          <NavLink className="nav-link" to="/dash">
            <FaHouseChimney size={25} className="icon" /> עמוד הבית
          </NavLink>
        </li>
        <li className="menu-item">
          <NavLink className="nav-link" to="/categories/transactions">
            <FaAddressBook size={25} className="icon" /> לקוחות
          </NavLink>
          <ul className={`submenu ${openIndex === 1 ? "open" : ""}`}>
            <li>ניהול לקוחות</li>
            <li>הוספת לקוח חדש</li>
          </ul>
        </li>
        <li className="menu-item">
          <NavLink className="nav-link" to="/categories/customerBilling">
            <FaSackDollar size={25} className="icon" /> הכנסות
          </NavLink>
          <ul className={`submenu ${openIndex === 2 ? "open" : ""}`}>
            <li>דוחות הכנסות</li>
            <li>הפקת חשבונית</li>
          </ul>
        </li>
        <li className="menu-item">
          <NavLink className="nav-link" to="/categories/paymentRequirements">
            <FaMoneyBillTransfer size={25} className="icon" /> הוצאות
          </NavLink>
          <ul className={`submenu ${openIndex === 3 ? "open" : ""}`}>
            <li>תשלומים שוטפים</li>
            <li>דוחות הוצאות</li>
          </ul>
        </li>
        <li className="menu-item">
          {/* <NavLink className="nav-link" to="/categories/creditClearing"> */}
          <NavLink className="nav-link" to="/dash">

            <FaCreditCard size={25} className="icon" /> סליקת אשראי
          </NavLink>
          <ul className={`submenu ${openIndex === 4 ? "open" : ""}`}>
            <li>חיובים שנכשלו</li>
            <li>דוחות סליקה</li>
          </ul>
        </li>
        <li className="menu-item">
          {/* <NavLink className="nav-link" to="/categories/standingOrders"> */}
          <NavLink className="nav-link" to="/dash">

            <FaArrowDownShortWide size={25} className="icon" /> הוראות קבע
          </NavLink>
          <ul className={`submenu ${openIndex === 5 ? "open" : ""}`}>
            <li>הוספת הוראה חדשה</li>
            <li>ניהול הוראות קיימות</li>
          </ul>
        </li>
        <li className="menu-item">
          {/* <NavLink className="nav-link" to="/categories/history"> */}
          <NavLink className="nav-link" to="/dash">

            <FaChartColumn size={25} className="icon" /> היסטוריה
          </NavLink>
          <ul className={`submenu ${openIndex === 6 ? "open" : ""}`}>
            <li>היסטוריית תשלומים</li>
            <li>היסטוריית פעולות</li>
          </ul>
        </li>
        <li className="menu-item">
          <NavLink className="nav-link" to="/dash/services">
          {/* <NavLink className="nav-link" to="/dash"> */}

            <FaPlay size={25} className="icon" /> שירותים
          </NavLink>
          <ul className={`submenu ${openIndex === 7 ? "open" : ""}`}>
            <li>שירותים פעילים</li>
            <li>הוספת שירות חדש</li>
          </ul>
        </li>
        <li className="menu-item">
          {/* <NavLink className="nav-link" to="/categories/contact"> */}
          <NavLink className="nav-link" to="/dash">

            <FaRegComments size={25} className="icon" /> צור קשר
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
