import { useState } from "react";
import { useGetAgentQuery} from "../../fetures/agent/apiSlice";
import {useUpdateAgentMutation } from "../../fetures/agent/AgentApiSlice";
import SaveCardForm from "./SaveCardForm";
import useAuth from "../../hooks/useAuth";

const PaymentDedails = () => {
  const { phone } = useAuth();
  const { data: agent, isLoading, isError } = useGetAgentQuery({ phone });
  const [updateAgent] = useUpdateAgentMutation();

  const [step, setStep] = useState("choose"); // choose | nedarim | gizbar | none | done

  const [mosadCode, setMosadCode] = useState("");
  const [apiValid, setApiValid] = useState("");
  const [confirmGizbar, setConfirmGizbar] = useState(false);
  const [chosenOption, setChosenOption] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    branchNumber: "",
  });

  if (isLoading) return <p>טוען...</p>;
  if (isError) return <p>שגיאה בטעינת נתונים</p>;

  const initialCustomerData = {
    FirstName: agent?.first_name,
    LastName: agent?.last_name,
    Phone: agent?.phone,
    Mail: agent?.email,
  };

  const handleChoose = (option) => {
    setChosenOption(option);
    setStep(option);
  };

  const handleSubmit = async () => {
    if (step === "nedarim" && mosadCode && apiValid) {
      await updateAgent({
        phone,
        paymentType: "nedarim",
        mosadCode,
        apiValid,
      });
      setStep("done");
    } else if (step === "gizbar" && confirmGizbar) {
      await updateAgent({
        phone,
        paymentType: "gizbar",
        mosadCode: process.env.REACT_APP_MOSAD,
        apiValid: process.env.REACT_APP_API_VALID,
      });
      setStep("done");
    } else if (step === "none") {
      await updateAgent({
        phone,
        paymentType: "none",
      });
      setStep("done");
    }
  };

  const handleBack = () => {
    setStep("choose");
    setMosadCode("");
    setApiValid("");
    setConfirmGizbar(false);
    setChosenOption("");
     setBankDetails({
      accountName: "",
      accountNumber: "",
      bankName: "",
      branchNumber: "",
    });
  };

  return (
    <div className="save-card-container" >
      {step === "choose" && (
        <>
        <h3>פעם ראשונה שאתה מבצע עסקה במערכת?<br/>רק שתי שאלות ומסיימים!</h3>
              <div className="credit-swipe" style={{ marginTop: "30px" }}><img src="/icons8-credit-card-50.png"/></div>
          <h2 style={{textAlign:"start"}}>1. באיזו דרך תרצה לגבות מהלקוח?</h2>
          <button className="borderBtn" onClick={() => handleChoose("nedarim")}> יש לי חשבון סליקה בנדרים פלוס</button><br />
          <button className="borderBtn" onClick={() => handleChoose("gizbar")}> אני רוצה להשתמש בסליקה דרך המערכת</button><br />
          <button className="borderBtn" onClick={() => handleChoose("none")}> אני לא מעוניין לגבות באשראי בינתיים</button>
        </>
      )}

      {step === "nedarim" && (
        <>
          <h4>נא הכנס קוד מוסד ו־ApiValid מנדרים פלוס:</h4>
          <input style={{marginBottom:"5px"}}
            placeholder="קוד מוסד"
            value={mosadCode}
            onChange={(e) => setMosadCode(e.target.value)}
          /><br />
          <input
            placeholder="ApiValid"
            value={apiValid}
            onChange={(e) => setApiValid(e.target.value)}
          /><br />
          <button onClick={handleSubmit} disabled={!mosadCode || !apiValid}>שמור</button>
          <button onClick={handleBack}>חזור</button>
        </>
      )}

      {step === "gizbar" && (
        <>
          <div style={{ border: "1px solid gray", padding: "10px", marginTop: "10px" }}>
            <p>
              אני מאשר שכל גביה באשראי תעבור דרך המערכת ואני אקבל את כל ההכנסות עד ל־10 בחודש הבא.<br />
              פירוט העסקאות וקבלות יופיע באזור האישי.
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
          <h4>פרטי חשבון בנק להעברה:</h4>
              <input style={{marginBottom:"5px"}}
                placeholder="שם בעל החשבון"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
              /><br />
              <input style={{marginBottom:"5px"}}
                placeholder="מספר חשבון"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              /><br />
              <input style={{marginBottom:"5px"}}
                placeholder="מספר סניף"
                value={bankDetails.branchNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, branchNumber: e.target.value })}
              /><br />
              <input
                placeholder="שם הבנק"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              /><br />

              <button
                onClick={handleSubmit}
                disabled={
                  !confirmGizbar ||
                  !bankDetails.accountName ||
                  !bankDetails.accountNumber ||
                  !bankDetails.bankName ||
                  !bankDetails.branchNumber
                }
              >
                שמור
              </button>
                      <button onClick={handleBack}>חזור</button>
        </>
      )}

      {step === "none" && (
        <>
          <p>בסדר גמור, תמיד אפשר לשנות זאת באזור האישי.</p>
          <button onClick={handleSubmit}>אישור</button>
          <button onClick={handleBack}>חזור</button>
        </>
      )}

      {step === "done" && (
        <>
          <p>העדפה נשמרה בהצלחה ✅</p>
          <button onClick={handleBack}>שנה בחירה</button>
        </>
      )}

      <SaveCardForm initialCustomerData={initialCustomerData} />
    </div>
  );
};

export default PaymentDedails;
