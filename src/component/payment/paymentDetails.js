import { useState } from "react";
import { useGetAgentQuery } from "../../fetures/agent/apiSlice";
import { useUpdateAgentMutation } from "../../fetures/agent/AgentApiSlice";
import SaveCardForm from "./SaveCardForm";
import useAuth from "../../hooks/useAuth";
import { TextField } from "@mui/material";

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
    accountNumber: null,
    bankNumber: null,
    branchNumber: null,
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
        _id: agent?._id,
        paymentType: "nedarim",
        mosadCode,
        apiValid,
      });
      setStep("done");
    } else if (step === "gizbar" && confirmGizbar) {
      await updateAgent({
        phone,
        _id: agent?._id,
        paymentType: "gizbar",
        bankDetails: bankDetails,
      });
      setStep("done");
    } else if (step === "none") {
      await updateAgent({
        phone,
        _id: agent?._id,
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
      bankNumber: "",
      branchNumber: "",
    });
  };

  return (
    <div className="save-card-container" >
      {step === "choose" && (
        <>
          <h3>פעם ראשונה שאתה מבצע עסקה במערכת?<br />רק שתי שאלות ומסיימים!</h3>
          <div className="credit-swipe" style={{ marginTop: "30px" }}><img src="/icons8-credit-card-50.png" /></div>
          <h2 style={{ textAlign: "start" }}>1. באיזו דרך תרצה לגבות מהלקוח?</h2>
          <button className="borderBtn" onClick={() => handleChoose("nedarim")}> יש לי חשבון סליקה בנדרים פלוס</button><br />
          <button className="borderBtn" onClick={() => handleChoose("gizbar")}> אני רוצה להשתמש בסליקה דרך המערכת</button><br />
          <button className="borderBtn" onClick={() => handleChoose("none")}> אני לא מעוניין לגבות באשראי בינתיים</button>
        </>
      )}

      {step === "nedarim" && (
        <>
          <h4 style={{ marginBottom: "15px" }}>נא הכנס קוד מוסד ו־ApiValid מנדרים פלוס:</h4>
          <TextField variant="outlined"
            style={{ marginBottom: "5px" }}
            label="קוד מוסד"
            value={mosadCode}
            onChange={(e) => setMosadCode(e.target.value)}
          /><br />
          <TextField variant="outlined"
            label="ApiValid"
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
              <TextField variant="outlined"
                type="checkbox"
                checked={confirmGizbar}
                onChange={() => setConfirmGizbar(!confirmGizbar)}
              />
              אני מאשר
            </label>

          </div>
          <h4>פרטי חשבון בנק להעברה:</h4>
          <TextField variant="outlined" style={{ marginBottom: "5px" }}
            label="שם בעל החשבון"
            value={bankDetails.accountName}
            onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
          /><br />
          <TextField variant="outlined" style={{ marginBottom: "5px" }}
            label="מספר חשבון"
            value={bankDetails.accountNumber}
            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
          /><br />
          <TextField variant="outlined" style={{ marginBottom: "5px" }}
            label="מספר סניף"
            value={bankDetails.branchNumber}
            onChange={(e) => setBankDetails({ ...bankDetails, branchNumber: e.target.value })}
          /><br />
          <TextField variant="outlined"
            label="שם הבנק"
            value={bankDetails.bankNumber}
            onChange={(e) => setBankDetails({ ...bankDetails, bankNumber: e.target.value })}
          /><br />

          <button
            onClick={handleSubmit}
            disabled={
              !confirmGizbar ||
              !bankDetails.accountName ||
              !bankDetails.accountNumber ||
              !bankDetails.bankNumber ||
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
