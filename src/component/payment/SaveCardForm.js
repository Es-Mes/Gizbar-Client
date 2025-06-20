import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const SaveCardForm = ({ initialCustomerData = {} }) => {
  const iframeRef = useRef(null);

  const [customerData, setCustomerData] = useState({
    FirstName: initialCustomerData.FirstName || "",
    LastName: initialCustomerData.LastName || "",
    Zeout: initialCustomerData.Zeout || "",
    Phone: initialCustomerData.Phone || "",
    Mail: initialCustomerData.Mail || "",
    Tokef: "",
    Currency: 1,
    PaymentType: "CreateToken", // שמירת טוקן בלבד
    Mosad:  process.env.REACT_APP_MOSAD,
    ApiValid:  process.env.REACT_APP_API_IFRAME,
    CallBack: process.env.REACT_APP_BASE_URL,
  });

  const [iframeHeight, setIframeHeight] = useState("400px");
  const [errorsMessage, setErrorsMessage] = useState("");

  const PostNedarim = (Data) => {
    const iframeWin = iframeRef.current?.contentWindow;
    if (iframeWin) iframeWin.postMessage(Data, "*");
  };

  useEffect(() => {
    const handleMessage = (event) => {
      console.log(`Event origin: ${event.origin}`);
      if (event.origin !== "https://www.matara.pro") return;

      const data = event.data;
      console.log("📩 data received from iframe:", data);

      if (data.Name === "Height") {
        setIframeHeight(`${Math.max(data.Value, 165)}px`);
        console.log("setIframeHeight");
        
      }

      if (data.Name === "TransactionResponse") {
        const { Status, Message, Token, Tokef, Card4Digits, CreditCardType } = data.Value;

        if (Status === "OK") {
          saveCardDetailsToDB({
            token: Token,
            tokef: customerData.Tokef,
            zeout: customerData.Zeout,
            last4: Card4Digits,
            cardType: CreditCardType,
            clientId: initialCustomerData._id,
          });

          toast.success("✅ הכרטיס נשמר בהצלחה!");
        } else {
          setErrorsMessage(Message || "שמירת הכרטיס נכשלה");
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

    PostNedarim({
      Name: "FinishTransaction2",
      Value: {
        ...customerData,
        CallBackMailError: "esterleah085@gmail.com",
      },
    });
  };

  const saveCardDetailsToDB = async (cardData) => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });
      if (!res.ok) throw new Error("שגיאה בשרת");
    } catch (err) {
      console.error(err);
      toast.error("❌ שגיאה בשמירת הכרטיס");
    }
  };

  return (
    <div className="save-card-container">
      <h2>שמירת כרטיס אשראי</h2>
      <form>
        <label>
          שם פרטי:
          <input type="text" name="FirstName" value={customerData.FirstName} onChange={handleChange} required />
        </label>
        <label>
          טלפון:
          <input type="text" name="Phone" value={customerData.Phone} onChange={handleChange} required />
        </label>
        <label>
  תעודת זהות:
  <input type="text" name="Zeout" value={customerData.Zeout} onChange={handleChange} required />
</label>
<label>
  תוקף כרטיס (MMYY):
  <input type="text" name="Tokef" value={customerData.Tokef || ""} onChange={handleChange} required />
</label>


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

        <button type="button" onClick={handleSaveCard}>
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
        label {
          display: block;
          margin-bottom: 10px;
          text-align: right;
        }
        input {
          width: 100%;
          padding: 8px;
          font-size: 16px;
          box-sizing: border-box;
        }
        button {
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
