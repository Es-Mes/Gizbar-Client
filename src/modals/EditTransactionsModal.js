import React, { useState } from "react";

const EditTransactionModal = ({ transaction, onClose }) => {
    const [alertsLevel, setAlertsLevel] = useState(transaction.alertsLevel);

    const handleSave = () => {
        console.log("נשמר עם רמת נודניקיות:", alertsLevel);
        onClose(); // סגירת המודל לאחר שמירה
    };

    return (
        <div>
            <h2>עריכת עסקה</h2>
            <label>
                רמת התראות:
                <select value={alertsLevel} onChange={(e) => setAlertsLevel(e.target.value)}>
                    <option value="once">פעם אחת</option>
                    <option value="weekly">שבועי</option>
                    <option value="nudnik">נודניק</option>
                </select>
            </label>
            <button onClick={handleSave}>שמור</button>
            <button onClick={onClose}>ביטול</button>
        </div>
    );
};

export default EditTransactionModal;
