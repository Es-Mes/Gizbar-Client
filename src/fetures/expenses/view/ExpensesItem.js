import React from 'react';
import './expensesItem.css'

const ExpensesItem = ({ transaction }) => {
    const {
        serviceName,
        price,
        status,
        billingDay,
        description,
        agent,
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

    const types_alerts = {
        'phone only': 'טלפון בלבד',
        'email only': 'מייל בלבד',
        'email and phone': 'טלפון ומייל',
        'human': 'תזכורת אנושית'
    }

    const alerts_level = {
        once: 'פעם אחת',
        weekly: 'שבועי',
        nudnik: 'נודניק,'
    }

    return (
        <div className='transaction-card'>
            <div className='transaction-header'>
                <h3>{serviceName || "שירות ללא שם"}</h3>
                <p className='expenses-price'>₪{price}</p>
            </div>
            <div className='transaction-body'>
                <p><strong>סטטוס:</strong> {statusTranslations[status]}</p>
                <p><strong>תאריך חיוב:</strong> {new Date(billingDay).toLocaleDateString('he-IL')}</p>
                <p><strong>נותן שירות:</strong> {`${agent.first_name} ${agent.last_name}`} </p>
                <p><strong>תיאור:</strong> {description}</p>
                <p><strong>התראות:</strong> {alerts ? "כן" : "לא"}</p>
                {alerts && (
                    <div className='alerts-info'>
                        <p><strong>סוג התראות:</strong> {types_alerts[typeAlerts]}</p>
                        <p><strong>רמת התראות:</strong> {alerts_level[alertsLevel]}</p>
                    </div>
                )}
            </div>
        </div>

    );
};

export default ExpensesItem;