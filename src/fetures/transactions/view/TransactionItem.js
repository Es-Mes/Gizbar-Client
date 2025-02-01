import React from 'react';
import './TransactionItem.css';

const TransactionItem = ({ transaction }) => {
    const {
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

    const statusTranslations = {
        notPaid: "לא שולם",
        paid: "שולם",
        pendingCharge: "ממתין לחיוב",
        canceled: "בוטל",
    };

    return (
        <div className='transaction-card'>
            <div className='transaction-header'>
                <h3>{serviceName || "שירות ללא שם"}</h3>
                <p className='transaction-price'>₪{price}</p>
            </div>
            <div className='transaction-body'>
                <p><strong>סטטוס:</strong> {statusTranslations[status] || status}</p>
                <p><strong>תאריך חיוב:</strong> {new Date(billingDay).toLocaleDateString('he-IL')}</p>
                <p><strong>לקוח:</strong> {customer.full_name}</p>
                <p><strong>תיאור:</strong> {description}</p>
                <p><strong>התראות:</strong> {alerts ? "כן" : "לא"}</p>
                {alerts && (
                    <div className='alerts-info'>
                        <p><strong>סוג התראות:</strong> {typeAlerts}</p>
                        <p><strong>רמת התראות:</strong> {alertsLevel}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionItem;