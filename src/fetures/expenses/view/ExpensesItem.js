import React from "react";
import "../../transactions/view/TransactionItem.css"

const alertsLevelMapping = {
    once: "פעם אחת",
    weekly: "שבועי",
    nudnik: "נודניק",
};

const ExpensesItem = ({ transaction }) => {

    return (
        <tr>
            <td>
                {
                    transaction.serviceName || "שירות ללא שם"
                }
            </td>
            <td>{transaction.agent.first_name} {transaction.agent.last_name}</td>
            <td>
                {
                    `₪${transaction.price}`
                }
            </td>
            <td>
                { transaction.status === "paid" ? "שולם" : "לא שולם"}
            </td>
          
           
        </tr>
    );
};

export default ExpensesItem;
