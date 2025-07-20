import { useState, useRef, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { useSaveCardDetailsMutation } from "../fetures/agent/AgentApiSlice";
import { toast } from "react-toastify";

const EditPaymentDetailsModal = ({ agent, onClose, onSuccess }) => {
    const iframeRef = useRef(null);
    const [saveCardDetails, { isLoading }] = useSaveCardDetailsMutation();

    const [customerData, setCustomerData] = useState({
        _id: agent?._id || "",
        FirstName: agent?.first_name || "",
        LastName: agent?.last_name || "",
        Zeout: agent?.zeout || "",
        Phone: agent?.phone || "",
        Mail: agent?.email || "",
        Tokef: "",
        Currency: 1,
        PaymentType: "CreateToken",
        Mosad: process.env.REACT_APP_MOSAD,
        ApiValid: process.env.REACT_APP_API_IFRAME,
        CallBack: process.env.REACT_APP_BASE_URL,
    });

    const customerDataRef = useRef(customerData);
    const [iframeHeight, setIframeHeight] = useState("400px");
    const [errorsMessage, setErrorsMessage] = useState("");
    const [step, setStep] = useState("form"); // form | iframe

    useEffect(() => {
        customerDataRef.current = customerData;
    }, [customerData]);

    const PostNedarim = (Data) => {
        const iframeWin = iframeRef.current?.contentWindow;
        if (iframeWin) iframeWin.postMessage(Data, "*");
    };

    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.origin !== "https://www.matara.pro") return;

            const data = event.data;
            console.log("📩 data received from iframe:", data);

            if (data.Name === "Height") {
                setIframeHeight(`${Math.max(data.Value, 165)}px`);
            }

            if (data.Name === "TransactionResponse") {
                const { Status, Token, LastNum } = data.Value;

                if (Status === "OK") {
                    try {
                        await saveCardDetails({
                            token: Token,
                            tokef: customerDataRef.current.Tokef,
                            zeout: customerDataRef.current.Zeout,
                            last4: LastNum,
                            clientId: agent._id,
                        }).unwrap();

                        toast.success("✅ הכרטיס נשמר בהצלחה!");
                        setErrorsMessage("");
                        onSuccess && onSuccess();
                        onClose();

                    } catch (error) {
                        console.error("❌ שגיאה בשמירת הכרטיס לשרת:", error);
                        setErrorsMessage("שמירת הכרטיס לשרת נכשלה");
                        toast.error("שגיאה בשמירת הכרטיס");
                    }
                } else {
                    setErrorsMessage("שמירת הכרטיס נכשלה");
                    toast.error("שמירת הכרטיס נכשלה");
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [saveCardDetails, agent._id, onSuccess, onClose]);

    useEffect(() => {
        if (iframeRef.current && step === "iframe") {
            iframeRef.current.onload = () => {
                console.log("📢 iframe onload – שולח בקשת גובה");
                PostNedarim({ Name: "GetHeight" });
            };
        }
    }, [step]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!customerData.FirstName.trim() || !customerData.Phone.trim() || !customerData.Zeout.trim() || !customerData.Tokef.trim()) {
            setErrorsMessage("שם, טלפון, תעודת זהות ותוקף כרטיס חובה");
            return false;
        }
        setErrorsMessage("");
        return true;
    };

    const handleNext = () => {
        if (!validateForm()) return;
        setStep("iframe");
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
        <div className="edit-payment-modal">
            <h3>עריכת פרטי תשלום</h3>

            {step === "form" && (
                <div className="payment-form">
                    <p className="info-text">
                        הכנס את הפרטים שלך לשמירת כרטיס אשראי במערכת
                    </p>

                    <div className="form-fields">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="שם פרטי"
                            name="FirstName"
                            value={customerData.FirstName}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="טלפון"
                            name="Phone"
                            value={customerData.Phone}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="תעודת זהות"
                            name="Zeout"
                            value={customerData.Zeout}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="תוקף כרטיס (MMYY)"
                            name="Tokef"
                            value={customerData.Tokef}
                            onChange={handleChange}
                            margin="normal"
                            placeholder="1225"
                            required
                        />
                    </div>

                    {errorsMessage && <div className="error-message">{errorsMessage}</div>}

                    <div className="modal-actions">
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={isLoading}
                        >
                            המשך לשמירת כרטיס
                        </Button>
                        <Button variant="outlined" onClick={onClose}>
                            ביטול
                        </Button>
                    </div>
                </div>
            )}

            {step === "iframe" && (
                <div className="iframe-step">
                    <p className="info-text">
                        השלם את הפרטים בטופס המאובטח למטה לשמירת הכרטיס
                    </p>

                    <iframe
                        ref={iframeRef}
                        onLoad={() => console.log("✅ iframe loaded")}
                        src="https://www.matara.pro/nedarimplus/iframe/?Tokef=Hide&CVV=Hide"
                        title="Save card form"
                        style={{
                            width: "100%",
                            border: "none",
                            minHeight: iframeHeight,
                            marginTop: "10px",
                            borderRadius: "8px",
                        }}
                    />

                    {errorsMessage && <div className="error-message">{errorsMessage}</div>}

                    <div className="modal-actions">
                        <Button
                            variant="contained"
                            onClick={handleSaveCard}
                            disabled={isLoading}
                        >
                            {isLoading ? 'שומר כרטיס...' : 'שמור כרטיס'}
                        </Button>
                        <Button variant="outlined" onClick={() => setStep("form")}>
                            חזור
                        </Button>
                        <Button variant="outlined" onClick={onClose}>
                            ביטול
                        </Button>
                    </div>
                </div>
            )}

            <style jsx>{`
        .edit-payment-modal {
          max-width: 500px;
          width: 90vw;
          padding: 30px;
          background: white;
          border-radius: 10px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .edit-payment-modal h3 {
          text-align: center;
          margin-bottom: 20px;
          color: var(--text);
        }

        .info-text {
          text-align: center;
          color: #666;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin: 20px 0;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 25px;
          flex-wrap: wrap;
        }

        .modal-actions button {
          min-width: 120px;
        }

        .error-message {
          color: #d32f2f;
          background-color: #ffebee;
          padding: 10px;
          border-radius: 5px;
          margin-top: 15px;
          text-align: center;
          font-weight: 500;
        }

        .iframe-step {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .edit-payment-modal {
            padding: 20px;
          }
          
          .modal-actions {
            flex-direction: column;
          }
          
          .modal-actions button {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
};

export default EditPaymentDetailsModal;
