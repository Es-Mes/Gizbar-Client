import React from "react";
import { useNavigate } from "react-router-dom";

import { Bar } from "react-chartjs-2"; // אם תרצי גרף
import { useMemo } from "react";
import { useGetAllTransactionsQuery } from "../../transactions/TransactionsApiSlice";
import useAuth from "../../../hooks/useAuth";

const CustomerDetails = ({ customer, isNarrow }) => {
  const phone = useAuth();
  const { data: transactions = [], isLoading: isLoading, error: error, refetch: refetchTransactions } = useGetAllTransactionsQuery(phone, {
    pollingInterval: 120000, // בדיקה כל 2 דקות - מאוזן לפרטי לקוח
  });
  console.log("CustomerDetails transactions:", transactions);


  const customerTransactions = transactions.filter(t => t.customer?._id === customer._id);
  // if (customerTransactions.length === 0) return <p>אין עסקאות ללקוח זה.</p>;
  // // Filter transactions by status



  const delayedTransactions = customerTransactions.filter(t => t.status === "notPaid");
  const delayedAmount = delayedTransactions.reduce((sum, t) => sum + t.price, 0);

  // חישוב סכום נגבה ב-12 חודשים אחרונים
  const currentDate = new Date();
  const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, currentDate.getDate());

  const totalCollectedLast12Months = customerTransactions.reduce((sum, t) => {
    if (t.status === "paid") {
      const transactionDate = new Date(t.billingDay);
      if (transactionDate >= twelveMonthsAgo) {
        return sum + t.price;
      }
    }
    return sum;
  }, 0);

  const navigate = useNavigate();
  const monthlySums = useMemo(() => {
    const result = {};
    customerTransactions.forEach(t => {
      const date = new Date(t.billingDay);
      const key = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      if (!result[key]) result[key] = 0;
      if (t.status === "paid") result[key] += t.price;
    });

    // יצירת 12 החודשים האחרונים
    const last12Months = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      last12Months.push({
        key,
        displayName: `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`,
        amount: result[key] || 0,
        hasData: result[key] > 0
      });
    }

    return last12Months;
  }, [customerTransactions]);

  const hasAnyMonthlyData = monthlySums.some(month => month.hasData);

  if (!customer || !transactions) return <p>טוען...</p>;

  return (
    <div style={{
      padding: "15px",
      fontSize: "0.95rem",
      background: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
      borderRadius: "8px",
      border: "1px solid var(--hoverBtnModel)"
    }}>
      {isNarrow && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "15px",
          padding: "10px",
          background: "#fff",
          borderRadius: "6px",
          border: "1px solid var(--bgSoftLight)"
        }}>
          <div>
            <strong style={{ color: "var(--text)" }}>אימייל:</strong>
            <div style={{ marginTop: "2px", color: "#666" }}>{customer.email || "לא מוגדר"}</div>
          </div>
          <div>
            <strong style={{ color: "var(--text)" }}>עיר:</strong>
            <div style={{ marginTop: "2px", color: "#666" }}>{customer.city || "לא מוגדר"}</div>
          </div>
        </div>
      )}

      {/* סיכום נתונים בכרטיסים */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "12px",
        marginBottom: "20px"
      }}>
        <div
          onClick={() => navigate(`/dash/transactions/income/providerList?customer=${customer._id}`)}
          style={{
            background: "#fff",
            padding: "12px",
            borderRadius: "8px",
            border: "2px solid var(--bgSoft)",
            cursor: "pointer",
            transition: "all 0.2s",
            textAlign: "center"
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--bgSoft)" }}>
            {customerTransactions.length}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text)", marginTop: "4px" }}>
            סה"כ עסקאות
          </div>
        </div>

        <div
          onClick={() => navigate(`/dash/transactions/income/providerList?customer=${customer._id}&filter=delayed`)}
          style={{
            background: "#fff",
            padding: "12px",
            borderRadius: "8px",
            border: "2px solid #dc3545",
            cursor: "pointer",
            transition: "all 0.2s",
            textAlign: "center"
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc3545" }}>
            {delayedTransactions.length}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text)", marginTop: "4px" }}>
            עסקאות בפיגור
          </div>
          <div style={{ fontSize: "0.8rem", color: "#dc3545", marginTop: "2px" }}>
            ₪{delayedAmount.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: "#fff",
          padding: "12px",
          borderRadius: "8px",
          border: "2px solid #28a745",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#28a745" }}>
            ₪{totalCollectedLast12Months.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text)", marginTop: "4px" }}>
            נגבה (12 חודשים)
          </div>
        </div>
      </div>

      {/* טבלה חודשית קבועה */}
      <div style={{ marginTop: "20px" }}>
        <h4 style={{
          marginBottom: "12px",
          fontSize: "1rem",
          color: "var(--text)",
          textAlign: "center"
        }}>
          סכומים שנגבו ב-12 החודשים האחרונים
        </h4>
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid var(--hoverBtnModel)",
          boxShadow: "0 2px 8px rgba(139, 123, 218, 0.08)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(85px, 1fr))",
            gap: "8px",
            textAlign: "center"
          }}>
            {monthlySums.map((month) => (
              <div key={month.key} style={{
                background: month.hasData ? "var(--bgSoft)" : "#f8f9fa",
                color: month.hasData ? "#fff" : "#6c757d",
                padding: "10px 6px",
                borderRadius: "8px",
                border: `1px solid ${month.hasData ? "var(--bgSoft)" : "#e9ecef"}`,
                transition: "all 0.2s",
                opacity: month.hasData ? 1 : 0.6
              }}>
                <div style={{
                  fontWeight: "600",
                  fontSize: "0.8rem",
                  marginBottom: "4px"
                }}>
                  {month.displayName}
                </div>
                <div style={{
                  fontWeight: month.hasData ? "bold" : "normal",
                  fontSize: "0.85rem"
                }}>
                  {month.hasData ? `₪${month.amount.toLocaleString()}` : "-"}
                </div>
              </div>
            ))}
          </div>

          {!hasAnyMonthlyData && (
            <div style={{
              textAlign: "center",
              color: "#6c757d",
              marginTop: "16px",
              fontSize: "0.9rem",
              fontStyle: "italic"
            }}>
              אין עסקאות ששולמו ב-12 החודשים האחרונים
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
