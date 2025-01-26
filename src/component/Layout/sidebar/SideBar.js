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

const Sidebar = () => {
  const [openIndex, setOpenIndex] = useState(null); // משתנה לניהול תפריטים פתוחים
  const [activeIndex, setActiveIndex] = useState(null); // משתנה לניהול פריט פעיל

  const toggleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? null : index); // ניהול פתיחה/סגירה של תפריט משנה
  };

  const setActive = (index) => {
    setActiveIndex(index); // שינוי צבע פריט פעיל
  };

  const calculateMargin = (index) => {
    // מחזיר מרווח דינמי לפי מספר הפריטים בתת-התפריט
    const submenu = document.querySelectorAll(".menu-item")[index]?.querySelector(".submenu");
    if (submenu && openIndex === index) {
      const itemCount = submenu.children.length; // חישוב מספר הפריטים
      return `${itemCount * 40}px`; // 40px עבור כל פריט בתת-תפריט
    }
    return "15px"; // מרווח ברירת מחדל
  };

  return (
    <div className="sidebar-main-menu">
      <ul>
        {[
          { title: "עמוד הבית", icon: FaHouseChimney, link: "/dash" },
          { title: "לקוחות", icon: FaAddressBook, link: "/dash/UnderConstruction", submenu: ["ניהול לקוחות", "הוספת לקוח חדש"] },
          { title: "הכנסות", icon: FaSackDollar, link: "/dash/transactions", submenu: ["דוחות הכנסות", "הפקת חשבונית"] },
          { title: "הוצאות", icon: FaMoneyBillTransfer, link: "/dash/UnderConstruction", submenu: ["תשלומים שוטפים", "דוחות הוצאות"] },
          { title: "סליקת אשראי", icon: FaCreditCard, link: "/dash/UnderConstruction", submenu: ["חיובים שנכשלו", "דוחות סליקה"] },
          { title: "הוראות קבע", icon: FaArrowDownShortWide, link: "/dash/UnderConstruction", submenu: ["הוספת הוראה חדשה", "ניהול הוראות קיימות"] },
          { title: "היסטוריה", icon: FaChartColumn, link: "/dash/UnderConstruction", submenu: ["היסטוריית תשלומים", "היסטוריית פעולות"] },
          { title: "שירותים", icon: FaPlay, link: "/dash/services", submenu: ["שירותים פעילים", "הוספת שירות חדש"] },
          { title: "צור קשר", icon: FaRegComments, link: "/dash/UnderConstruction" },
        ].map((menu, index) => (
          <li
            key={index}
            className={`menu-item ${activeIndex === index ? "active" : ""}`}
            onClick={() => {
              toggleSubmenu(index);
              setActive(index);
            }}
            style={{ marginBottom: calculateMargin(index) }} // חישוב דינמי של מרווח
          >
            <NavLink className="nav-link" to={menu.link}>
              {React.createElement(menu.icon, { size: 25, className: "icon" })} {menu.title}
            </NavLink>
            {menu.submenu && (
              <ul className={`submenu ${openIndex === index ? "open" : ""}`}>
                {menu.submenu.map((submenuItem, subIndex) => (
                  <li key={subIndex}>{submenuItem}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
