import React, { useState } from 'react';
import './TransactionItem.css'

const TransactionItem = ({ transaction }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        serviceName,
        price,
        status,
        billingDay,
        description,
        agent,
        customer,
        alerts,
        typeAlerts,
        alertsLevel,
    } = transaction;

    // תרגום סטטוסים לעברית
    const statusTranslations = {
        notPaid: "לא שולם",
        paid: "שולם",
        pendingCharge: "ממתין לחיוב",
        canceled: "בוטל",
    };

    return (
        <div className='container'>
            {/* שורה בסיסית */}
            <div className='basicRow'>
                <span>{serviceName || "שירות ללא שם"}</span>
                <span>₪{price.toFixed(2)}</span>
                <span>{statusTranslations[status] || status}</span>
                <span>{new Date(billingDay).toLocaleDateString('he-IL')}</span>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className='toggleButton'
                >
                    {isExpanded ? "▲" : "▼"}
                </button>
            </div>

            {/* פרטים נוספים */}
            {isExpanded && (
                <div className='details'>
                    <p><strong>סוכן:</strong> {agent}</p>
                    <p><strong>לקוח:</strong> {customer}</p>
                    <p><strong>תיאור:</strong> {description}</p>
                    <p><strong>התראות:</strong> {alerts ? "כן" : "לא"}</p>
                    {alerts && (
                        <>
                            <p><strong>סוג התראות:</strong> {typeAlerts}</p>
                            <p><strong>רמת התראות:</strong> {alertsLevel}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TransactionItem;
