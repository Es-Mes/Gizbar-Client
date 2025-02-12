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
  const [activeIndex, setActiveIndex] = useState(0); // משתנה לניהול פריט פעיל

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

  const menuItems = [
    { title: "עמוד הבית", icon: FaHouseChimney, link: "/dash" },
    {
      title: "לקוחות",
      icon: FaAddressBook,
      link: "/dash/customers",
      // submenu: [
      //   // { title: "ניהול לקוחות", link: "/dash/UnderConstruction" },
      //   // { title: "הוספת לקוח חדש", link: "/dash/UnderConstruction" },
      //   // { title: "ניהול לקוחות", link: "/dash/customers/manage" },
      //   // { title: "הוספת לקוח חדש", link: "/dash/customers/add" },
      // ],
    },
    {
      title: "הכנסות",
      icon: FaSackDollar,
      link: "/dash/transactions/income",
      submenu: [
        // { title: "דוחות הכנסות", link: "/dash/transactions/income/reports" },
        // { title: "הפקת חשבונית", link: "/dash/transactions/income/invoice/create" },
        { title: "כל ההכנסות", link: "/dash/transactions/income/all" },
        // { title: "דוחות הכנסות", link: "/dash/UnderConstruction" },
        // { title: "הפקת חשבונית", link: "/dash/UnderConstruction" },
        { title: "תשלומים בפיגור", link: "/dash/transactions/income/delayed" },
      ],
    },
    {
      title: "הוצאות",
      icon: FaMoneyBillTransfer,
      link: "/dash/UnderConstruction",
      // submenu: [
      // { title: "תשלומים שוטפים", link: "/dash/UnderConstruction" },
      // { title: "דוחות הוצאות", link: "/dash/UnderConstruction" },
      // { title: "תשלומים שוטפים", link: "/dash/expenses/payments" },
      // { title: "דוחות הוצאות", link: "/dash/expenses/reports" },
      // ],
    },
    {
      title: "סליקת אשראי",
      icon: FaCreditCard,
      link: "/dash/UnderConstruction",
      // submenu: [
      // { title: "חיובים שנכשלו", link: "/dash/credit/failed" },
      // { title: "דוחות סליקה", link: "/dash/credit/reports" },
      // { title: "חיובים שנכשלו", link: "/dash/UnderConstruction" },
      // { title: "דוחות סליקה", link: "/dash/UnderConstruction" },
      // ],
    },
    {
      title: "הוראות קבע",
      icon: FaArrowDownShortWide,
      link: "/dash/UnderConstruction",
      // submenu: [
      //   { title: "הוספת הוראה חדשה", link: "/dash/debit/new" },
      //   { title: "ניהול הוראות קיימות", link: "/dash/debit/manage" },
      //   { title: "הוספת הוראה חדשה", link: "/dash/UnderConstruction" },
      //   { title: "ניהול הוראות קיימות", link: "/dash/UnderConstruction" },
      // ],
    },
    {
      title: "היסטוריה",
      icon: FaChartColumn,
      link: "/dash/UnderConstruction",
      // submenu: [
      //   { title: "היסטוריית תשלומים", link: "/dash/history/payments" },
      //   { title: "היסטוריית פעולות", link: "/dash/history/actions" },
      //   { title: "היסטוריית תשלומים", link: "/dash/UnderConstruction" },
      //   { title: "היסטוריית פעולות", link: "/dash/UnderConstruction" },
      // ],
    },
    {
      title: "שירותים",
      icon: FaPlay,
      link: "/dash/services",
      // submenu: [
      //   { title: "שירותים לא פעילים", link: "/dash/services/freezed" },
      //   { title: "הוספת שירות חדש", link: "/dash/services/add" },
      // ],
    },
    {
      title: "צור קשר",
      icon: FaRegComments,
      link: "/dash/UnderConstruction"
    },

  ];


  return (
    <div className="sidebar-main-menu">
      <ul>
        {menuItems.map((menu, index) => (
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
                  <li key={subIndex}>
                    <NavLink className="nav-link"
                      to={submenuItem.link}
                      onClick={(e) => e.stopPropagation()}>
                      {submenuItem.title}
                    </NavLink>
                  </li>
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
