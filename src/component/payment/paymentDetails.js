import { useState } from "react";
import { useGetAgentQuery } from "../../fetures/agent/apiSlice";
import { useUpdateAgentMutation, useUpdatePaymentDetailsMutation } from "../../fetures/agent/AgentApiSlice";
import SaveCardForm from "./SaveCardForm";
import useAuth from "../../hooks/useAuth";
import { TextField } from "@mui/material";
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';


const PaymentDedails = () => {
  const { phone } = useAuth();
  const { data: agent, isLoading, isError } = useGetAgentQuery({ phone });
  const [updatePaymentDetails] = useUpdatePaymentDetailsMutation()

  const [step, setStep] = useState("choose"); // choose | nedarim | gizbar | none | done
  const [error,setError] = useState("")
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

  const banks = [
  { name: 'בנק הפועלים', number: '12' },
  { name: 'בנק לאומי', number: '10' },
  { name: 'בנק דיסקונט', number: '11' },
  { name: 'הבנק הבינלאומי', number: '31' },
  { name: 'בנק מזרחי טפחות', number: '20' },
  { name: 'פאג"י (בנק פועלי אגודת ישראל)', number: '52' },
  { name: 'בנק ירושלים', number: '54' },
  { name: 'בנק אגוד', number: '13' },
  { name: 'בנק מסד', number: '46' },
  { name: 'בנק יהב', number: '52' },
  { name: 'דואר ישראל', number: '09' },
  // אפשר להוסיף עוד לפי הצורך
];


  if (isLoading) return <p>טוען...</p>;
  if (isError) return <p>שגיאה בטעינת נתונים</p>;

  const initialCustomerData = {
    _id: agent?._id,
    Zeout: agent?.zeout,
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
  try {
    let payload;
    if (step === "nedarim" && mosadCode && apiValid) {
      payload = {
        _id: agent?._id,
        paymentType: "nedarim",
        mosadCode,
        apiValid,
      };
    } else if (step === "gizbar" && confirmGizbar) {
      payload = {
        _id: agent?._id,
        paymentType: "gizbar",
        bankDetails,
      };
    } else if (step === "none") {
      payload = {
        _id: agent?._id,
        paymentType: "none",
      };
    } else {
      setError("אנא מלאי את כל השדות הדרושים");
      return;
    }

    const response = await updatePaymentDetails(payload);
    if (response.error) {
      setError(response.message || "שגיאה בעדכון פרטי תשלום");
    } else {
      setStep("done");
    }
  } catch (err) {
    console.error(err);
    setError("שגיאה כללית בשרת. נסי שוב מאוחר יותר.");
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
            <div className="field-group full-width">
            <label>
              <input className="noFocus"
              style={{margin:'10px'}}
                type="checkbox"
                checked={confirmGizbar}
                onChange={() => setConfirmGizbar(!confirmGizbar)}
              />
              אני מאשר
            </label>
            </div>

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


          <FormControl fullWidth variant="outlined" style={{ marginBottom: '16px' }}>
            <InputLabel id="bank-select-label">בנק</InputLabel>
            <Select
              labelId="bank-select-label"
              value={bankDetails.bankNumber}
              label="בנק"
              onChange={(e) =>
                setBankDetails({
                  ...bankDetails,
                  bankNumber: e.target.value,
                })
              }
            >
              {banks.map((bank) => (
                <MenuItem key={bank.number} value={bank.number}>
                  {bank.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


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
          {error && <div className="text-red-600">{error}</div>}

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
