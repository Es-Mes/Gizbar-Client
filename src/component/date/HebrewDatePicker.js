// HebrewDatePicker.jsx
import React, { useState, useEffect, useRef } from "react";
import { HDate } from "@hebcal/core";

const hebrewMonths = [
  "ניסן", "אייר", "סיוון", "תמוז", "אב", "אלול",
  "תשרי", "חשוון", "כסלו", "טבת", "שבט", "אדר א׳", "אדר ב׳"
];

const daysOfWeek = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

const hebrewNumber = (num) => {
  const hebrewDigits = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"];
  const tens = ["", "י", "כ", "ל"];
  if (num === 15) return "טו";
  if (num === 16) return "טז";
  if (num <= 10) return hebrewDigits[num];
  if (num < 20) return "י" + hebrewDigits[num - 10];
  if (num <= 30) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + hebrewDigits[unit];
  }
  return num;
};

const yearToHebrew = (year) => {
  const hebrewNums = [
    ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"],
    ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"],
    ["", "ק", "ר", "ש", "ת"]
  ];
  const shortYear = year % 1000;
  const hundreds = Math.floor(shortYear / 100);
  const tens = Math.floor((shortYear % 100) / 10);
  const ones = shortYear % 10;
  let hebrewYear = "";
  if (hundreds > 0) hebrewYear += hebrewNums[2][hundreds] || "";
  if (tens > 0) hebrewYear += hebrewNums[1][tens] || "";
  if (ones > 0) hebrewYear += hebrewNums[0][ones] || "";
  if (hebrewYear.length >= 2) {
    hebrewYear = hebrewYear.slice(0, -1) + "״" + hebrewYear.slice(-1);
  } else {
    hebrewYear += "׳";
  }
  return hebrewYear;
};

const addHebrewMonths = (hdate, offset) => {
  let month = hdate.getMonth();
  let year = hdate.getFullYear();
  for (let i = 0; i < Math.abs(offset); i++) {
    if (offset > 0) {
      month++;
      if (month === 7) year++;
      if (month > 13 || (!hdate.isLeapYear() && month > 12)) month = 1;
    } else {
      month--;
      if (month < 1) month = hdate.isLeapYear() ? 13 : 12;
      if (month === 6) year--;
    }
  }
  return new HDate(1, month, year);
};

const HebrewDatePicker = ({ name, value, onChange, required, label = "בחר תאריך" }) => {
  const showDate = value ? new Date(value) : new Date();
  const selectedHDate = new HDate(showDate);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentHDate, setCurrentHDate] = useState(selectedHDate);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstOfMonth = new HDate(1, currentHDate.getMonth(), currentHDate.getFullYear());
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = currentHDate.daysInMonth();

  const daysArray = Array(firstWeekday).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const handleSelect = (day) => {
    if (!day) return;
    const hdate = new HDate(day, currentHDate.getMonth(), currentHDate.getFullYear());
    const gregDate = hdate.greg();
    const iso = gregDate.toISOString().slice(0, 10);
    onChange?.({ target: { name, value: iso } });
    setShowCalendar(false);
  };

  const formatHebrewDate = (hdate) => {
    const day = hdate.getDate();
    let monthIndex = hdate.getMonth() - 1;
    if (monthIndex === 11 && !hdate.isLeapYear()) {
      monthIndex = 11; // אדר רגיל
    } else if (monthIndex === 12 && !hdate.isLeapYear()) {
      monthIndex = 11; // אדר רגיל
    }
    const month = hebrewMonths[monthIndex] || "";
    const year = yearToHebrew(hdate.getFullYear());
    return `${hebrewNumber(day)} ${month} ${year}`;
  };

  return (
    <div style={{ position: "relative", maxWidth: 360, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <label htmlFor={name} style={{ display: "block", marginBottom: 6 }}>{label}{required && " *"}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="text"
          id={name}
          name={name}
          readOnly
          required={required}
          value={formatHebrewDate(selectedHDate)}
          onClick={() => setShowCalendar((v) => !v)}
          style={{ padding: 10, borderRadius: 5, border: "1px solid #ccc", width: "100%", backgroundColor: "white", color: "#444", fontWeight: "bold", cursor: "pointer" }}
        />
        <button
          onClick={() => setShowCalendar((v) => !v)}
          type="button"
          style={{ cursor: "pointer", padding: 8, backgroundColor: "var(--bgSoft)", border: "none", borderRadius: 6, color: "white", fontSize: 18 }}
        >📅</button>
      </div>

      {showCalendar && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 999 }} />
          <div
            ref={popupRef}
            style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, backgroundColor: "white", borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.3)", padding: 16, width: 320, fontFamily: "Arial, sans-serif", zIndex: 1000 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "var(--bgSoft)" }}>
                {hebrewMonths[currentHDate.getMonth() - 1]} {yearToHebrew(currentHDate.getFullYear())}
              </h3>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setCurrentHDate(addHebrewMonths(currentHDate, -1))} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "var(--bgSoft)" }}>&lt;</button>
                <button onClick={() => setCurrentHDate(addHebrewMonths(currentHDate, 1))} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "var(--bgSoft)" }}>&gt;</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, textAlign: "center" }}>
              {daysOfWeek.map((d) => (
                <div key={d} style={{ fontWeight: "bold", color: "var(--bgSoft)" }}>{d}</div>
              ))}
              {daysArray.map((day, i) => day ? (
                <button
                  key={i}
                  onClick={() => handleSelect(day)}
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", backgroundColor: "white", color: "#444", cursor: "pointer", fontSize: 14 }}
                >{hebrewNumber(day)}</button>
              ) : <div key={i} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HebrewDatePicker;
