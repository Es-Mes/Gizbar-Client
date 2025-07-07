import { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";

import jsPDF from 'jspdf';
import "jspdf-font"; // מייבא פונטים בעברית
import Modal from "../../modals/Modal";

const PaymentForm = ({ initialCustomerData,outsieder}) => {
    const iframeRef = useRef(null);
    const initialData = initialCustomerData || {};
    const [customerData, setCustomerData] = useState({
        FirstName: initialData.FirstName || "",
        LastName: initialData.LastName || "",
        Zeout: initialData.Zeout || "",
        Phone: initialData.Phone || "",
        Mail: initialData.Mail || "",
        Amount: initialData.Amount || "",
        Currency: 1, // שקלים
        PaymentType: "Ragil",
        Tashlumim: 1,
        Param1:initialData.transactionID,
        Mosad: initialData.mosad? initialData.mosad : process.env.REACT_APP_MOSAD,
        ApiValid: initialData.apiValid? initialData.apiValid : process.env.REACT_APP_API_IFRAME,
        Comment: "",
        CallBack: process.env.REACT_APP_CALLBACK_URL,
    });

    const [paymentStatus, setPaymentStatus] = useState(null);
    const [iframeHeight, setIframeHeight] = useState("400px");
    const [errors, setErrors] = useState({});
    const [errorsMessage, setErrorsMessage] = useState("");
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [shovarNumber, setShovarNumber] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [amount, setAmount] = useState(0);


    //  const handleCopy = () => {
    //         if (!initialCustomerData || !initialCustomerData.Phone || !initialCustomerData.transactionID) {
    //             toast.error("נתונים לא זמינים להעתקה.");
    //             return;
    //         }
    //       const baseUrl = process.env.REACT_APP_CLIENT_URL || "";
    //       const link = `${baseUrl}/payment/${initialCustomerData?.Phone}/${initialCustomerData?.transactionID}`;
    //       navigator.clipboard.writeText(link)
    //           .then(() => toast.success("הקישור הועתק 👍 ",{icon:false}))
    //           .catch(() => toast.error("העתקה נכשלה."));
    //   };

    const validateForm = () => {
        const newErrors = {};
        let hasErrors = false;

        if (!customerData.FirstName.trim()) {
            newErrors.FirstName = "שם פרטי חובה";
            hasErrors = true;
        }

        // // הוספתי בדיקת טלפון
        // if (!customerData.Phone.trim() || !/^\d{9,10}$/.test(customerData.Phone)) {
        //     newErrors.Phone = "מספר טלפון לא תקין";
        //     hasErrors = true;
        // }

        // // הוספתי בדיקת מייל
        // if (!customerData.Mail.trim() || !/\S+@\S+\.\S+/.test(customerData.Mail)) {
        //     newErrors.Mail = "אימייל לא תקין";
        //     hasErrors = true;
        // }

        // בדיקת סכום
        if (!customerData.Amount || customerData.Amount <= 0) {
            newErrors.Amount = "יש להזין סכום חיובי";
            hasErrors = true;
        }

        // בדיקת תשלומים
        if (!customerData.Tashlumim || customerData.Tashlumim < 1) {
            newErrors.Tashlumim = "יש להזין מספר תשלומים תקף";
            hasErrors = true;
        }

        // הודעת שגיאה כוללת
        const errorMessages = Object.values(newErrors).join(" | ");
        setErrorsMessage(hasErrors ? errorMessages || "נא לוודא שכל השדות תקינים ומלאים" : "");

        setErrors(newErrors);
        return !hasErrors;
    };

    const PostNedarim = (Data) => {
        var iframeWin = iframeRef.current?.contentWindow;
        if (iframeWin) iframeWin.postMessage(Data, "*");
    };

    useEffect(() => {
        const handleMessage = (event) => {
            console.log("Event origin:", event.origin);
            console.log("Full event data:", event.data);

            if (event.origin !== "https://www.matara.pro") return;

            const data = event.data;

            // עדכון גובה
            if (data.Name === "Height") {
                if (data.Value < 320) {
                    setIframeHeight(`320px`);
                }
                else {
                    setIframeHeight(`${data.Value}px`);
                    console.log("גובה התעדכן:", data.Value);
                }
            }

            // תגובה לעסקה
            if (data.Name === "TransactionResponse") {
                const status = data.Value.Status;
                const message = data.Value.Message;

                console.log("סטטוס מהעסקה:", status);
                console.log("הודעה מהעסקה:", message);

                if (status === "OK") {
                    const shovar = data.Value.Shovar;
                    const clientName = data.Value.ClientName;
                    const amountPaid = customerData.Amount; // או מה שיש לך

                    setShovarNumber(shovar);
                    setCustomerName(clientName);
                    setAmount(amountPaid);
                    setShowReceiptModal(true);

                    console.log("✅ התשלום הצליח! מספר שובר:", shovar);
                }
                else {
                    setPaymentStatus("❌ התשלום נכשל, אנא נסה שוב.");
                    setErrorsMessage(message); // הצגת הודעת השגיאה שמגיעה מהשרת
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);


    useEffect(() => {
        if (iframeRef.current) {
            iframeRef.current.onload = () => {
                PostNedarim({ Name: "GetHeight" });
            };
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handlePayment = () => {
        if (!validateForm()) {
            console.log("Validation failed. Customer data:", customerData);
            return;
        }

        console.log("ApiValid:", customerData.ApiValid);
        console.log("API_VALID:", process.env.REACT_APP_API_IFRAME);
        console.log("Customer Data:", customerData);

        PostNedarim({
            Name: "FinishTransaction2",
            Value: {
                ...customerData,
                // CallBack: process.env.REACT_APP_CLIENT_URL,
                CallBackMailError: "esterleah085@gmail.com",
            },
        });
    };

    const generateReceiptPDF = () => {
        const doc = new jsPDF();

        // טעינת הגופן Yehuda
        doc.addFont("/fonts/Yehuda.ttf", "Yehuda", "normal");
        doc.setFont("Yehuda");


        // בדיקה אם הפונט נטען
        console.log(doc.getFontList()); // לוודא שהפונט קיים


        // תמיכה ב-RTL (עברית מימין לשמאל)
        doc.setR2L(true);
        doc.setFontSize(16);

        // כותרת הקבלה
        doc.setTextColor(33, 33, 33);
        doc.text("קבלה על תשלום", 105, 20, { align: "center" });

        // תוכן הקבלה
        doc.text(`שם הלקוח: ${customerName}`, 180, 40, { align: "right" });
        doc.text(`מספר שובר: ${shovarNumber}`, 180, 60, { align: "right" });
        doc.text(`סכום התשלום: ${amount} ש"ח`, 180, 80, { align: "right" });

        // הודעה בסוף
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.text("תודה שבחרתם בנו!", 105, 100, { align: "center" });

        doc.save(`receipt_${shovarNumber}.pdf`);
    };

    return (<>
        <div className="payment-container">
            <form>
                {[
                    { label: "שם פרטי", name: "FirstName" },
                    { label: "שם משפחה", name: "LastName" },
                    { label: "תעודת זהות", name: "Zeout" },
                    { label: "טלפון", name: "Phone" },
                    { label: "אימייל", name: "Mail", type: "email" },
                    { label: "סכום לתשלום", name: "Amount", type: "number" },
                    { label: "מספר תשלומים", name: "Tashlumim", type: "number" },
                ].map(({ label, name, type = "text" }) => (
                     (outsieder)?  <label key={name} className="form-label">
                        {label}:
                        <input
                            className="TextBox"
                            type={type}
                            name={name}
                            value={customerData[name]}
                            onChange={handleChange}
                            min={name === "Tashlumim" || name === "Amount" ? "1" : undefined} // מינימום לערכים מספריים
                            required
                            readOnly
                        />
                        {errors[name] && (
                            <span className="error">{errors[name]}</span>
                        )}
                    </label>
                    : 
                    <label key={name} className="form-label">
                        {label}:
                        <input
                            className="TextBox"
                            type={type}
                            name={name}
                            value={customerData[name]}
                            onChange={handleChange}
                            min={name === "Tashlumim" || name === "Amount" ? "1" : undefined} // מינימום לערכים מספריים
                            required
                        />
                        {errors[name] && (
                            <span className="error">{errors[name]}</span>
                        )}
                    </label>
                ))}

                <label className="form-label">אופן התשלום:</label>
                <br />
                <select
                    className="form-select"
                    name="PaymentType"
                    value={customerData.PaymentType}
                    onChange={handleChange}
                >
                    <option value="Ragil">רגיל</option>
                    <option value="HK">הוראת קבע</option>
                </select>

                <h2>פרטי תשלום</h2>
                <iframe
                    id="NedarimFrame"
                    ref={iframeRef}
                    src="https://www.matara.pro/nedarimplus/iframe/"
                    style={{
                        width: "100%",
                        border: "none",
                        minHeight: iframeHeight,
                    }}
                />
                {paymentStatus && (
                    <p className="payment-status">{paymentStatus}</p>
                )}
                <p className="errorsMessage">{errorsMessage}</p>
                <button
                    type="button"
                    className="pay-button"
                    onClick={handlePayment}
                >
                    לתשלום
                </button>
            </form>

            <style>{`
                .payment-container {
                    max-width: 500px;
                    margin: auto;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }

                .form-label,.form-select {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 10px;
                    text-align: right;
                    font-weight: bold;
                }
                .form-select {
                    font-weight: normal;
                }

                .TextBox {
                    font-family: 'Assistant', sans-serif;
                    font-size: large;
                    color: black;
                    width: 100%;
                    text-align: right;
                    padding: 6px;
                    border: 1px solid rgba(0,0,0,.125);
                    border-radius: 2px;
                    box-sizing: border-box;
                    margin-top: 2px;
                    outline: none;
                }

                .error {
                    color: red;
                    font-size: 12px;
                }
                .errorsMessage {
                    color: red;
                    font-size: 20px;
                }

                .pay-button {
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

                .pay-button:hover {
                    background-color: var(--text);
                }

                .payment-status {
                    margin-top: 15px;
                    font-size: 18px;
                    font-weight: bold;
                }
            `}</style>
            {
                <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <h2>✅ תודה! התשלום התקבל בהצלחה.</h2>
                        <p>מספר שובר: <strong>{shovarNumber}</strong></p>
                        <div style={{ marginTop: '20px' }}>
                            <button onClick={generateReceiptPDF} >
                                הורד קבלה PDF
                            </button>
                            <button onClick={() => window.location.href = '/dash'} style={{ background: '#ccc' }}>
                                חזרה לעמוד הבית
                            </button>
                        </div>
                    </div>
                </Modal>
            }
        </div></>

    );
};

export default PaymentForm;
