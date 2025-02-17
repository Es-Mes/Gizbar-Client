// import React from 'react';
// import './TransactionItem.css';

// const TransactionItem = ({ transaction }) => {
//     const {
//         serviceName,
//         price,
//         status,
//         billingDay,
//         description,
//         customer,
//         alerts,
//         typeAlerts,
//         alertsLevel,
//     } = transaction;

//     const statusTranslations = {
//         notPaid: "לא שולם",
//         paid: "שולם",
//         pendingCharge: "ממתין לחיוב",
//         canceled: "בוטל",
//     };

//     const types_alerts = {
//         'phone only': 'טלפון בלבד',
//         'email only': 'מייל בלבד',
//         'email and phone': 'טלפון ומייל',
//         'human': 'תזכורת אנושית'
//     }

//     const alerts_level = {
//         once: 'פעם אחת',
//         weekly: 'שבועי',
//         nudnik: 'נודניק,'
//     }

//     return (
//         <div className='transaction-card'>
//             <div className='transaction-header'>
//                 <h3>{serviceName || "שירות ללא שם"}</h3>
//                 <p className='transaction-price'>₪{price}</p>
//             </div>
//             <div className='transaction-body'>
//                 <p><strong>סטטוס:</strong> {statusTranslations[status] || status}</p>
//                 <p><strong>תאריך חיוב:</strong> {new Date(billingDay).toLocaleDateString('he-IL')}</p>
//                 <p><strong>לקוח:</strong> {customer.full_name}</p>
//                 <p><strong>תיאור:</strong> {description}</p>
//                 <p><strong>התראות:</strong> {alerts ? "כן" : "לא"}</p>
//                 {alerts && (
//                     <div className='alerts-info'>
//                         <p><strong>סוג התראות:</strong> {types_alerts[typeAlerts]}</p>
//                         <p><strong>רמת התראות:</strong> {alerts_level[alertsLevel]}</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default TransactionItem;
import React, { useState } from "react";
import { GrEdit, GrCheckmark, GrClose } from "react-icons/gr";
import "./TransactionItem.css"

const alertsLevelMapping = {
    once: "פעם אחת",
    weekly: "שבועי",
    nudnik: "נודניק",
};

const TransactionItem = ({ transaction, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTransaction, setEditedTransaction] = useState({ ...transaction });

    const handleChange = (e) => {
        setEditedTransaction({
            ...editedTransaction,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        onUpdate(editedTransaction);
        setIsEditing(false);
    };
    function formatDate(isoString) {
        let date = new Date(isoString);
        return date.toLocaleDateString("he-IL"); // פורמט ישראלי: DD/MM/YYYY
    }

    return (
        <tr>
            <td>
                {isEditing ? (
                    <input
                        type="text"
                        name="serviceName"
                        value={editedTransaction.serviceName}
                        onChange={handleChange}
                    />
                ) : (
                    editedTransaction.serviceName || "שירות ללא שם"
                )}
            </td>
            <td>
                {isEditing ? (
                    <input
                        type="number"
                        name="price"
                        value={editedTransaction.price}
                        onChange={handleChange}
                    />
                ) : (
                    `₪${editedTransaction.price}`
                )}
            </td>
            <td>
                {isEditing ? (
                    <select
                        name="status"
                        value={editedTransaction.status}
                        onChange={handleChange}
                    >
                        <option value="paid">שולם</option>
                        <option value="notPaid">לא שולם</option>
                    </select>
                ) : editedTransaction.status === "paid" ? "שולם" : "לא שולם"}
            </td>
            <td>{editedTransaction.customer.full_name}</td>
            <td>{formatDate(editedTransaction.createdAt)}</td>
            {editedTransaction.paymentDate? <td>{formatDate(editedTransaction.paymentDate)}</td>
            :<td>{formatDate(editedTransaction.billingDay)}</td>}

            <td>
                {isEditing ? (
                    <select
                        name="alertsLevel"
                        value={editedTransaction.alertsLevel}
                        onChange={handleChange}
                    >
                        <option value="once">פעם אחת</option>
                        <option value="weekly">שבועי</option>
                        <option value="nudnik">נודניק</option>
                    </select>
                ) : (
                    alertsLevelMapping[editedTransaction.alertsLevel] || "לא מוגדר"
                )}
            </td>
            <td style={{ cursor: "pointer" }}>
                {isEditing ? (
                    <>
                        <GrCheckmark size={20} color="green" onClick={handleSave} />
                        <GrClose size={20} color="red" onClick={() => setIsEditing(false)} />
                    </>
                ) : (
                    <GrEdit size={20} color="teal" onClick={() => setIsEditing(true)} />
                )}
            </td>
        </tr>
    );
};

export default TransactionItem;
