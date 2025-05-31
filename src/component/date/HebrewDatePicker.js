import { HDate, GregorianDate } from '@hebcal/core';
import { useState } from 'react';

const HebrewDatePicker = ({ onChange }) => {
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1); // 1 = ניסן
  const [year, setYear] = useState(5784);

  const handleConvert = () => {
    try {
      const hdate = new HDate(day, month, year);
      const gregorian = hdate.greg(); // מחזיר Date רגיל
      onChange(gregorian.toISOString().split('T')[0]); // מחזיר YYYY-MM-DD
    } catch (e) {
      console.error('שגיאה בהמרה:', e);
    }
  };

  return (
    <div>
      <label>תאריך חיוב (עברי):</label>
      <div className="hebrew-date-picker">
        <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
          {[...Array(30)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {[
            "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול",
            "תשרי", "חשוון", "כסלו", "טבת", "שבט", "אדר", "אדר ב'"
          ].map((name, idx) => (
            <option key={idx} value={idx + 1}>{name}</option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
        <button type="button" onClick={handleConvert}>בחר</button>
      </div>
    </div>
  );
};
export default HebrewDatePicker;