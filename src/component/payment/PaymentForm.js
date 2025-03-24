import { useEffect, useRef, useState } from "react";

const PaymentForm = ({ initialCustomerData }) => {
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
            // 🔎 מעקב אחרי כל הודעה שנכנסת
            console.log("Event received!");
            console.log("Event origin:", event.origin);
            console.log("Full event data:", event.data);

            if (event.origin !== "https://www.matara.pro") {
                console.log("❗ הודעה שנפסלה בגלל origin לא תואם");
                return;
              }          

            if (data.height) {
                setIframeHeight(`${data.height}px`);
                console.log("גובה התעדכן:", data.height);
            }

            if (data.status) {
                setPaymentStatus(
                    data.status === "success"
                        ? "✅ התשלום הצליח!"
                        : "❌ התשלום נכשל, אנא נסה שוב."
                );
                window.scrollTo({ top: 0, behavior: "smooth" }); // גלילה למעלה בהצלחה/כישלון
            }

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
                    { label: "מספר תשלומים", name: "Tashlumim", type: "number" },
                ].map(({ label, name, type = "text" }) => (
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
        </div>
    );
};

export default PaymentForm;
