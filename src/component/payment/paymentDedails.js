import { useState } from "react";
import { useGetAgentQuery } from "../../fetures/agent/apiSlice";
import SaveCardForm from "./SaveCardForm";
import useAuth from "../../hooks/useAuth";

const PaymentDedails = () => {
  const { phone } = useAuth();
  const { data: agent, isLoading, isError } = useGetAgentQuery({ phone });

  const [paymentOption, setPaymentOption] = useState("");
  const [mosadCode, setMosadCode] = useState("");
  const [apiValid, setApiValid] = useState("");
  const [confirmGizbar, setConfirmGizbar] = useState(false);

  if (isLoading) return <p>טוען...</p>;
  if (isError) return <p>שגיאה בטעינת נתונים</p>;

  const initialCustomerData = {
    FirstName: agent?.first_name,
    LastName: agent?.last_name,
    Phone: agent?.phone,
    Mail: agent?.email,
  };

  const handleSave = () => {
    if (paymentOption === "nedarim" && mosadCode && apiValid) {
      // עדכון agent עם פרטי נדרים פלוס
      console.log("שולח לשרת:", {
        paymentType: "nedarim",
        mosadCode,
        apiValid,
      });
    }

    if (paymentOption === "gizbar" && confirmGizbar) {
      console.log("שולח לשרת:", {
        paymentType: "gizbar",
        mosadCode: process.env.REACT_APP_MOSAD,
        apiValid: process.env.REACT_APP_API_VALID,
      });
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <h3>צורת גבייה מועדפת:</h3>
      <label>
        <input
          type="radio"
          value="nedarim"
          checked={paymentOption === "nedarim"}
          onChange={() => setPaymentOption("nedarim")}
        />
        יש לי חשבון סליקה בנדרים פלוס
      </label>
      <br />
      <label>
        <input
          type="radio"
          value="gizbar"
          checked={paymentOption === "gizbar"}
          onChange={() => setPaymentOption("gizbar")}
        />
        אני רוצה להשתמש בסליקה דרך המערכת
      </label>
      <br />
      <label>
        <input
          type="radio"
          value="none"
          checked={paymentOption === "none"}
          onChange={() => setPaymentOption("none")}
        />
        אני לא מעוניין לגבות באשראי בינתיים
      </label>

      <div style={{ marginTop: "20px" }}>
        {paymentOption === "nedarim" && (
          <>
            <h4>נא הכנס קוד מוסד ו־ApiValid מנדרים פלוס:</h4>
            <input
              placeholder="קוד מוסד"
              value={mosadCode}
              onChange={(e) => setMosadCode(e.target.value)}
            />
            <br />
            <input
              placeholder="ApiValid"
              value={apiValid}
              onChange={(e) => setApiValid(e.target.value)}
            />
          </>
        )}

        {paymentOption === "gizbar" && (
          <div style={{ border: "1px solid gray", padding: "10px", marginTop: "10px" }}>
            <p>
              אני מאשר שכל גביה באשראי תעבור דרך המערכת ואני אקבל את כל ההכנסות עד
              ל־10 בחודש הבא. פירוט העסקאות וקבלות יופיע באזור האישי.
            </p>
            <label>
              <input
                type="checkbox"
                checked={confirmGizbar}
                onChange={() => setConfirmGizbar(!confirmGizbar)}
              />
              אני מאשר
            </label>
          </div>
        )}

        {paymentOption === "none" && (
          <p style={{ color: "gray", marginTop: "10px" }}>
            בסדר גמור, תמיד אפשר לשנות זאת באזור האישי.
          </p>
        )}
      </div>

      <br />
      <button type="button" onClick={handleSave}>
        שמור העדפה
      </button>

      <div className="credit-swipe" style={{ marginTop: "30px" }}>💳</div>
      <SaveCardForm initialCustomerData={initialCustomerData} />
    </div>
  );
};

export default PaymentDedails;
