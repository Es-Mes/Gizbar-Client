import { TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSaveCardDetailsMutation } from "../../fetures/agent/AgentApiSlice";
const SaveCardForm = ({ initialCustomerData = {} }) => {
  const iframeRef = useRef(null);

  const [customerData, setCustomerData] = useState({
    _id: initialCustomerData._id || "",
    FirstName: initialCustomerData.FirstName || "",
    LastName: initialCustomerData.LastName || "",
    Zeout: initialCustomerData.Zeout || "",
    Phone: initialCustomerData.Phone || "",
    Mail: initialCustomerData.Mail || "",
    Tokef: "",
    Currency: 1,
    PaymentType: "CreateToken", // שמירת טוקן בלבד
    Mosad: process.env.REACT_APP_MOSAD,
    ApiValid: process.env.REACT_APP_API_IFRAME,
    CallBack: process.env.REACT_APP_BASE_URL,
  });

  const customerDataRef = useRef(customerData);

  useEffect(() => {
    customerDataRef.current = customerData;
  }, [customerData]);

  const [iframeHeight, setIframeHeight] = useState("400px");
  const [errorsMessage, setErrorsMessage] = useState("");
  const [saveCardDetails] = useSaveCardDetailsMutation();

  const PostNedarim = (Data) => {
    const iframeWin = iframeRef.current?.contentWindow;
    if (iframeWin) iframeWin.postMessage(Data, "*");
  };

  useEffect(() => {
    const handleMessage = async (event) => {
      console.log(`Event origin: ${event.origin}`);
      if (event.origin !== "https://www.matara.pro") return;

      const data = event.data;
      console.log("📩 data received from iframe:", data);

      if (data.Name === "Height") {
        setIframeHeight(`${Math.max(data.Value, 165)}px`);
        console.log("setIframeHeight");

      }

      if (data.Name === "TransactionResponse") {
        const { Status, Token, LastNum } = data.Value;

        if (Status === "OK") {
          console.log("✅ Transaction successful:", data.Value)
          console.log(`saving card details for customer: ${customerData.Zeout} ${customerData.Tokef}`);

          try {
            await saveCardDetails({
              token: Token,
              tokef: customerDataRef.current.Tokef,
              zeout: customerDataRef.current.Zeout,
              last4: LastNum,
              clientId: initialCustomerData._id,
            }).unwrap();

            toast.success("✅ הכרטיס נשמר בהצלחה!", { icon: false });
            setErrorsMessage("");

          } catch (error) {
            console.error("❌ שגיאה בשמירת הכרטיס לשרת:", error);
            setErrorsMessage("שמירת הכרטיס לשרת נכשלה");
          }
        }
        else {
          setErrorsMessage("שמירת הכרטיס נכשלה");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        console.log("📢 iframe onload – שולח בקשת גובה");
        PostNedarim({ Name: "GetHeight" });
      };
    }
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
    console.log(customerData);
  };

  const validateForm = () => {
    if (!customerData.FirstName.trim() || !customerData.Phone.trim()) {
      setErrorsMessage("שם וטלפון חובה");
      return false;
    }
    setErrorsMessage("");
    return true;
  };

  const handleSaveCard = () => {
    if (!validateForm()) return;
    const { Tokef, ...customerDataWithoutTokef } = customerData;
    PostNedarim({
      Name: "FinishTransaction2",
      Value: {
        ...customerDataWithoutTokef,
        CallBackMailError: "esterleah085@gmail.com",
      },
    });
  };



  return (
    <div className="card-details-form">
      <div className="rotating-coin"><img src="/icons8-coin-50.png" /></div>
      <h2 style={{ textAlign: "start" }}> 2. איך תרצה שהמערכת תגבה ממך? </h2>
      <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>


        <TextField variant="outlined" label="שם פרטי" type="text" name="FirstName" value={customerData.FirstName} onChange={handleChange} required />

        <TextField variant="outlined" label="טלפון" type="text" name="Phone" value={customerData.Phone} onChange={handleChange} required />

        <TextField variant="outlined" label="תעודת זהות" type="text" name="Zeout" value={customerData.Zeout} onChange={handleChange} required />

        <TextField variant="outlined" label="תוקף כרטיס (MMYY)" type="text" name="Tokef" value={customerData.Tokef || ""} onChange={handleChange} required />



        <iframe
          id="NedarimSaveCard"
          ref={iframeRef}
          onLoad={() => console.log("✅ iframe loaded")}
          src="https://www.matara.pro/nedarimplus/iframe/?Tokef=Hide&CVV=Hide"
          style={{
            width: "100%",
            border: "none",
            minHeight: iframeHeight,
            marginTop: "10px",
          }}
        />

        {errorsMessage && <p className="error-message">{errorsMessage}</p>}

        <button className="saveBtn" type="button" onClick={handleSaveCard}>
          שמור כרטיס
        </button>
      </form>

      <style>{`
        .save-card-container {
          max-width: 450px;
          margin: auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
          .borderBtn{
    background-color: var(--bgWhite) !important;
    color: var(--text) !important;
    border: solid 1.5px var(--text) !important;
    padding: 10px 15px;
    font-size: large;
    cursor: pointer;
    border-radius: 5px;
    margin-top: 15px;
    width: 100%;
}
        .borderBtn:hover{
         background-color: var(--text) !important;
         color: var(--bgWhite) !important;
        }
        .card-details-form{
        margin-top:10px;
        }
        .card-details-form label {
          display: block;
          margin-bottom: 30px;
          text-align: right;
        }
        .card-details-form TextField variant="outlined" {
          width: 100%;
          padding: 8px;
          margin-bottom:5px;
          font-size: 16px;
          box-sizing: border-box;
        }
        .card-details-form button,
         .save-card-container button{
           background-color: var(--bgSoft);
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    font-size: large;
                    cursor: pointer;
                    border-radius: 5px;
                    margin-top: 15px;
                    width: 100%;
        }
                    button:hover{
                     background-color: var(--text);
                     }
                     .modal-close{
                     margin-top:0;
                     width:10%;
                     padding:0;
                     }
        .error-message {
          color: red;
          font-weight: bold;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default SaveCardForm;
