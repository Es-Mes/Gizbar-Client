import { useEffect, useRef, useState } from "react";

const PaymentForm = ({ initialCustomerData }) => {
    const iframeRef = useRef(null);
    const [customerData, setCustomerData] = useState({
        FirstName: initialCustomerData?.FirstName || "",
        LastName: "",
        Zeout: "",
        Phone: initialCustomerData?.Phone || "",
        Mail: initialCustomerData?.Mail || "",
        Amount: initialCustomerData?.Amount || "",
        Currency: 1, // שקלים
        PaymentType: "Ragil",
        Tashlumim: 1,
        Mosad: process.env.REACT_APP_MOSAD,
        ApiValid: process.env.REACT_APP_API_IFRAME,
        Comment: "",
    });

    const [paymentStatus, setPaymentStatus] = useState(null);
    const [iframeHeight, setIframeHeight] = useState("400px");
    const [errors, setErrors] = useState({});
    const [errorsMessage, setErrorsMessage] = useState("");


    const validateForm = () => {
        const newErrors = {};
        setErrorsMessage("")
        if (!customerData.FirstName.trim()) {
            newErrors.FirstName = "שם פרטי חובה";
            setErrorsMessage("נא לוודא שכל שדות החובה מלאים")
        }
        // if (!customerData.LastName.trim()) newErrors.LastName = "שם משפחה חובה";
        // if (!customerData.Zeout.trim() || !/^\d{9}$/.test(customerData.Zeout)) newErrors.Zeout = "תעודת זהות לא תקינה";
        // if (!customerData.Mail.trim() || !/\S+@\S+\.\S+/.test(customerData.Mail)) newErrors.Mail = "אימייל לא תקין";
        if (!customerData.Amount || customerData.Amount <= 0) {
            newErrors.Amount = "יש להזין סכום חיובי";
            setErrorsMessage("נא לוודא שכל שדות החובה מלאים")
        }
        if (!customerData.Tashlumim || customerData.Tashlumim < 1) {
            newErrors.Tashlumim = "יש להזין מספר תשלומים תקף";
            setErrorsMessage("נא לוודא שכל שדות החובה מלאים")
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const PostNedarim = (Data) => {
        var iframeWin = iframeRef.current?.contentWindow;
        if (iframeWin) iframeWin.postMessage(Data, "*");
    };


    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== "https://www.matara.pro") return;

            const data = event.data;
            if (data.height) {
                setIframeHeight(`${data.height}px`);
            }
            if (data.status) {
                setPaymentStatus(data.status === "success" ? "✅ התשלום הצליח!" : "❌ התשלום נכשל, אנא נסה שוב.");
            }
            // קליטת הודעות שגיאה מהאייפריים
            if (data.message) {
                setErrorsMessage(data.message);
                console.log("Message from iframe:", data.message);
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

            return;
        }
        console.log("ApiValid:", customerData.ApiValid);
        console.log("API_VALID:", process.env.REACT_APP_API_IFRAME);
        console.log("Customer Data:", customerData);

        const event = PostNedarim({
            Name: "FinishTransaction2",
            Value: {
                ...customerData,
                CallBack: process.env.REACT_APP_BASE_URL,
                CallBackMailError: "esterleah085@gmail.com",
            },
        });
    };

    return (
        <div className="payment-container">
            <form>
                {[
                    { label: "שם פרטי", name: "FirstName" },
                    { label: "שם משפחה", name: "LastName" },
                    { label: "תעודת זהות", name: "Zeout" },
                    { label: "טלפון", name: "Phone" },
                    { label: "אימייל", name: "Mail", type: "email" },
                    { label: "סכום לתשלום", name: "Amount", type: "number" },
                    { label: "מספר תשלומים", name: "Tashlumim", type: "number" }
                ].map(({ label, name, type = "text" }) => (
                    <label key={name} className="form-label">
                        {label}:
                        <input className="TextBox" type={type} name={name} value={customerData[name]} onChange={handleChange} required />
                        {errors[name] && <span className="error">{errors[name]}</span>}
                    </label>
                ))}

                <label className="form-label">אופן התשלום:</label><br />
                <select className="form-select" name="PaymentType" value={customerData.PaymentType} onChange={handleChange}>
                    <option value="Ragil">רגיל</option>
                    <option value="HK">הוראת קבע</option>
                </select>

                <h2>פרטי תשלום</h2>
                <iframe
                    id="NedarimFrame"
                    ref={iframeRef}
                    src="https://www.matara.pro/nedarimplus/iframe/"
                    style={{ width: "100%", border: "none", minHeight: iframeHeight }}
                />
                {paymentStatus && <p className="payment-status">{paymentStatus}</p>}
                <p className="errorsMessage">{errorsMessage}</p>
                <button type="button" className="pay-button" onClick={handlePayment}>לתשלום</button>
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
                .form-select{
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
                .errorsMessage{
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
        </div>
    );
};

export default PaymentForm;
