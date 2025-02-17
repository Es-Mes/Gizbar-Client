import React from "react";
import "../../transactions/view/TransactionItem.css"

const alertsLevelMapping = {
    once: "פעם אחת",
    weekly: "שבועי",
    nudnik: "נודניק",
};

const ExpensesItem = ({ transaction }) => {
    function formatDate(isoString) {
        let date = new Date(isoString);
        return date.toLocaleDateString("he-IL"); // פורמט ישראלי: DD/MM/YYYY
    }

    return (
        <tr>
            <td>
                {
                    transaction.serviceName || "שירות ללא שם"
                }
            </td>
            <td>{transaction.agent.first_name} {transaction.agent.last_name}</td>
            <td>{formatDate(transaction.createdAt)}</td>
            {transaction.paymentDate ? <td>{formatDate(transaction.paymentDate)}</td>
                : <td>{formatDate(transaction.billingDay)}</td>}
            <td>
                {
                    `₪${transaction.price}`
                }
            </td>
            <td>
                {transaction.status === "paid" ? "שולם" : "לא שולם"}
            </td>


        </tr>
    );
};

export default ExpensesItem;
