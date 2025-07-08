import React from "react";
import { useNavigate } from "react-router-dom";

import { Bar } from "react-chartjs-2"; // אם תרצי גרף
import { useMemo } from "react";
import { useGetAllTransactionsQuery } from "../../transactions/TransactionsApiSlice";
import useAuth from "../../../hooks/useAuth";

const CustomerDetails = ({customer}) => {
  const phone = useAuth();
  const  {data :transactions = []} = useGetAllTransactionsQuery({phone});
  // if (!customer || !transactions) return <p>טוען...</p>;
  const customerTransactions = transactions.filter(t => t.customer?._id === customer._id);
  // if (customerTransactions.length === 0) return <p>אין עסקאות ללקוח זה.</p>;
  // // Filter transactions by status
 

  
  const delayedTransactions = customerTransactions.filter(t => t.status === "delayed");
  const totalCollected = customerTransactions.reduce((sum, t) => sum + (t.status === "paid" ? t.amount : 0), 0);
  const delayedAmount = delayedTransactions.reduce((sum, t) => sum + t.amount, 0);

  const navigate = useNavigate();
  const monthlySums = useMemo(() => {
    const result = {};
    transactions.forEach(t => {
      const date = new Date(t.billingDay);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!result[key]) result[key] = 0;
      if (t.status === "paid") result[key] += t.amount;
    });
    return result;
  }, [transactions]);

  const months = Object.keys(monthlySums);
  const data = {
    labels: months,
    datasets: [
      {
        label: 'סכום שנגבה',
        data: months.map(m => monthlySums[m]),
        backgroundColor: "#755ded"
      }
    ]
  };

  return (
    <div style={{ padding: "10px", fontSize: "0.95rem" }}>
      <p>
        <strong>עסקאות:</strong>{" "}
        <span onClick={() => navigate(`providerList?q=${customer.full_name}`)} style={{ color: "#755ded", cursor: "pointer" }}>
          {transactions.length} עסקאות
        </span>
      </p>

      <p>
        <strong>עסקאות בפיגור:</strong>{" "}
        <span onClick={() => navigate(`providerList?q=${customer.full_name}&filter=delayed`)} style={{ color: "red", cursor: "pointer" }}>
          {delayedTransactions.length} עסקאות בפיגור ({delayedAmount} ₪)
        </span>
      </p>

      <p>
        <strong>סכום כולל שנגבה:</strong> {totalCollected.toLocaleString()} ₪
      </p>

      {months.length > 0 && (
        <div style={{ maxWidth: "100%", marginTop: "10px" }}>
          <h4>סכומים לפי חודשים:</h4>
          <table style={{ width: "100%", textAlign: "center", background: "#f0f0f5", borderRadius: "8px", overflow: "hidden" }}>
            <thead>
              <tr>
                <th>חודש</th>
                <th>סכום שנגבה (₪)</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>{monthlySums[month].toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
