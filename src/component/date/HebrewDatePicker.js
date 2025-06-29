import React, { useState, useEffect, useRef } from "react";
import { HDate, months } from "@hebcal/core";
import { FaRegSquareCaretUp } from "react-icons/fa6";
import { FaArrowUp } from "react-icons/fa6";

const now = new Date();
const hdate = new HDate(now);

console.log("Gregorian today:", now.toLocaleDateString());
console.log("Hebrew date:", hdate.toString());


const hebrewNumber = (num) => {
  const hebrewDigits = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט","י"];
  const tens = ["", "י", "כ", "ל"];
  if (num <= 10) return hebrewDigits[num];
  if (num == 15) return "טו"
  if (num == 16) return "טז"
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
    ["", "ק", "ר", "ש", "ת"],
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

const hebrewMonths = [
  "ניסן",
  "אייר",
  "סיוון",
  "תמוז",
  "אב",
  "אלול",
  "תשרי",
  "חשוון",
  "כסלו",
  "טבת",
  "שבט",
  "אדר ",
  "אדר ב׳",
];

const daysOfWeek = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

const HebrewDatePickerPopup = ({ selectedHDate, onSelect, onClose }) => {
  const [currentHDate, setCurrentHDate] = useState(selectedHDate || new HDate());
  const popupRef = useRef(null);

  // סגירת הפופאפ בלחיצה מחוץ לו
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const firstOfMonth = new HDate(1, currentHDate.getMonth(), currentHDate.getFullYear());
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = currentHDate.daysInMonth();

  const daysArray = [];
  for (let i = 0; i < firstWeekday; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

  function addHebrewMonths(hdate, offset) {
    const day = 1;
    let month = hdate.getMonth();
    let year = hdate.getFullYear();
    console.log(`month: ${month}`);

    for (let i = 0; i < Math.abs(offset); i++) {
      if (offset > 0) {
        month++;
        if (month === 7) {
          year++;
        }
        else if (month > 12 && !hdate.isLeapYear()) {
          month = 1;
        }
        else if (month > 13) {
          month = 1;
        }
      } else {
        month--;
        if (month < 1) {

          if (hdate.isLeapYear()) {
            month = 13;
          }
          else {
            month = 12;
          }
        }
        if (month === 6) {
          year--;
        }
      }
    }

    return new HDate(day, month, year);
  }

  const nextMonth = () => {
    setCurrentHDate(addHebrewMonths(currentHDate, 1));
  };

  const prevMonth = () => {
    setCurrentHDate(addHebrewMonths(currentHDate, -1));
  };

  const selectDay = (day) => {
    if (!day) return;
    const newDate = new HDate(day, currentHDate.getMonth(), currentHDate.getFullYear());
    onSelect && onSelect(newDate);
    onClose();
  };

  const selectedDay = selectedHDate ? selectedHDate.getDate() : null;

  return (
    <>
      {/* רקע כהה מאחורי הפופאפ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.25)",
          zIndex: 999,
        }}
      />
      {/* הפופאפ עצמו */}
      <div
        ref={popupRef}
        style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 6,
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          padding: 12,
          width: 280,
          height: 290,
          fontFamily: "Arial, sans-serif",
          zIndex: 1000,
          userSelect: "none",
        }}
      >

        <div
          className="head"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            marginBottom: 10,
            gap: 8,
            paddingTop: 4,
paddingBottom: 6,
          }}
        >
          <h3
            style={{
              color: "var(--bgSoft)",
              margin: 0,
              fontSize: 16,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {hebrewMonths[currentHDate.getMonth() - 1]}{" "}
            {yearToHebrew(currentHDate.getFullYear())}
          </h3>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={nextMonth}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                color: "var(--bgSoft)",
              }}
              type="button"
            >
              &gt;
            </button>
            <button
              onClick={prevMonth}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                color: "var(--bgSoft)",
              }}
              type="button"
            >
              &lt;
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 6,
            textAlign: "center",
          }}
        >
          {daysOfWeek.map((d) => (
            <div key={d} style={{ fontWeight: "bold", color: "var(--bgSoft)" }}>
              {d}
            </div>
          ))}

          {daysArray.map((day, i) =>
            day ? (
              <button
                key={i}
                onClick={() => selectDay(day)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: day === selectedDay ? "2px solid var(--bgSoft)" : "1px solid #ccc",
                  backgroundColor: day === selectedDay ? "var(--bgSoft)" : "white",
                  color: day === selectedDay ? "white" : "#444",
                  cursor: "pointer",
                  fontWeight: day === selectedDay ? "bold" : "normal",
                  transition: "all 0.2s",
                  fontSize: 14,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = day === selectedDay ? "var(--bgSoft)" : "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = day === selectedDay ? "var(--bgSoft)" : "white")
                }
                type="button"
              >
                {hebrewNumber(day)}
              </button>
            ) : (
              <div key={i} />
            )
          )}
        </div>
      </div>
    </>
  );
};

const HebrewDateInputFixed = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedHDate, setSelectedHDate] = useState(new HDate(new Date()));
  const [currentHDate, setCurrentHDate] = useState(new HDate(new Date()));


  const formatHebrewDate = (hdate) => {
    const day = hdate.getDate();
    const monthName = hebrewMonths[hdate.getMonth() - 1] || "";
    const yearHebrew = yearToHebrew(hdate.getFullYear());
    return `${hebrewNumber(day)} ${monthName} ${yearHebrew}`;
  };


  const handleDateSelect = (hdate) => {
    setSelectedHDate(hdate);
    setShowCalendar(false);
  };

  return (
    <div style={{ position: "relative", maxWidth: 360, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <label htmlFor="billingDay" style={{ display: "block", marginBottom: 6 }}>
        תאריך חיוב: <span className="required-asterisk">*</span>
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="text"
          id="billingDay"
          name="billingDay"
          readOnly
          value={formatHebrewDate(selectedHDate)}
          onClick={() => setShowCalendar((v) => !v)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100%",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#444",
            fontWeight: "bold",
          }}
        />
        <button
          onClick={() => setShowCalendar((v) => !v)}
          aria-label="בחר תאריך"
          style={{
            cursor: "pointer",
            padding: 8,
            backgroundColor: "var(--bgSoft)",
            border: "none",
            borderRadius: 6,
            color: "white",
            fontSize: 18,
            lineHeight: 1,
          }}
          type="button"
        >
          📅
        </button>
      </div>

      {showCalendar && (
        <HebrewDatePickerPopup
          selectedHDate={selectedHDate}
          onSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
};

export default HebrewDateInputFixed;
