import React from 'react';
import './TransactionItem.css';

const TransactionItem = ({ transaction, isExpanded, onToggleExpand }) => {
    const {
        _id,
        serviceName,
        price,
        status,
        billingDay,
        description,
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
                <span>₪{price}</span>
                <span>{statusTranslations[status] || status}</span>
                <span>{new Date(billingDay).toLocaleDateString('he-IL')}</span>
                <button onClick={onToggleExpand} className='toggleButton'>
                    {isExpanded ? "▲" : "▼"}
                </button>
            </div>

            {/* פרטים נוספים */}
            {isExpanded && (
                <div className='details'>
                    <p><strong>לקוח:</strong> {customer.full_name}</p>
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
