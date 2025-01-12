// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import {useAddTransactionMutation} from "../TransactionsApiSlice"
// import { selectToken } from "../../auth/authSlice"; 
// import {jwtDecode} from "jwt-decode";

// const AddTransaction = () => {
//     const token = useSelector(selectToken);
//     const navigate = useNavigate();
//     const [addTransaction, { isLoading, isSuccess, isError, error }] =
//         useAddTransactionMutation();

//     const [agentServices, setAgentServices] = useState([]);
//     const [customers, setCustomers] = useState([]);
//     const [selectedService, setSelectedService] = useState(null);
//     const [selectedCustomer, setSelectedCustomer] = useState(null);
//     const [transactionDetails, setTransactionDetails] = useState({
//         description: "",
//         price: "",
//         billingDay: "",
//         status: "pendingCharge",
//     });

//     useEffect(() => {
//         if (token) {
//             const decoded = jwtDecode(token);
//             setAgentServices(decoded.services);
//             setCustomers(decoded.customers);
//         }
//     }, [token]);

//     useEffect(() => {
//         if (isSuccess) {
//             navigate("/transactions"); // נווט לעמוד עסקאות
//         }
//     }, [isSuccess, navigate]);

//     const handleServiceChange = (event) => {
//         const serviceId = event.target.value;
//         const service = agentServices.find((srv) => srv._id === serviceId);
//         setSelectedService(service);
//     };

//     const handleCustomerChange = (event) => {
//         const customerId = event.target.value;
//         const customer = customers.find((cust) => cust._id === customerId);
//         setSelectedCustomer(customer);
//     };

//     const handleInputChange = (event) => {
//         const { name, value } = event.target;
//         setTransactionDetails((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();
//         if (!selectedService || !selectedCustomer) {
//             alert("בחר שירות ולקוח!");
//             return;
//         }
//         const transactionData = {
//             agent: token._id, // מתוך הטוקן
//             customer: selectedCustomer._id,
//             service: selectedService._id,
//             serviceName: selectedService.name,
//             ...transactionDetails,
//         };
//         addTransaction(transactionData);
//     };

//     return (
//         <div>
//             <h1>הוסף עסקה</h1>
//             <form onSubmit={handleSubmit}>
//                 {/* בחירת שירות */}
//                 <label>בחר שירות:</label>
//                 <select onChange={handleServiceChange} required>
//                     <option value="">-- בחר שירות --</option>
//                     {agentServices.map((service) => (
//                         <option key={service._id} value={service._id}>
//                             {service.name}
//                         </option>
//                     ))}
//                 </select>
//                 <button type="button" onClick={() => navigate("/add-service")}>
//                     הוסף שירות חדש
//                 </button>

//                 {/* בחירת לקוח */}
//                 <label>בחר לקוח:</label>
//                 <select onChange={handleCustomerChange} required>
//                     <option value="">-- בחר לקוח --</option>
//                     {customers.map((customer) => (
//                         <option key={customer._id} value={customer._id}>
//                             {customer.first_name} {customer.last_name}
//                         </option>
//                     ))}
//                 </select>
//                 <button type="button" onClick={() => navigate("/add-customer")}>
//                     הוסף לקוח חדש
//                 </button>

//                 {/* מילוי פרטים נוספים */}
//                 <label>תיאור:</label>
//                 <textarea
//                     name="description"
//                     value={transactionDetails.description}
//                     onChange={handleInputChange}
//                     required
//                 />
//                 <label>מחיר:</label>
//                 <input
//                     type="number"
//                     name="price"
//                     value={transactionDetails.price}
//                     onChange={handleInputChange}
//                     required
//                 />
//                 <label>תאריך חיוב:</label>
//                 <input
//                     type="date"
//                     name="billingDay"
//                     value={transactionDetails.billingDay}
//                     onChange={handleInputChange}
//                     required
//                 />
//                 <button type="submit" disabled={isLoading}>
//                     {isLoading ? "שולח..." : "שלח עסקה"}
//                 </button>
//             </form>
//             {isError && <p className="error">{error?.data?.message}</p>}
//         </div>
//     );
// };

// export default AddTransaction;




// // import "./AddTransaction.css";
// // import { useAddTransactionMutation } from "../TransactionsApiSlice";
// // import { useEffect } from "react";
// // import { useNavigate } from "react-router-dom";

// // const AddTransaction = ({ agentPhone }) => {
// //     const [addTransaction, { error, isError, isLoading, isSuccess }] = useAddTransactionMutation();
// //     const navigate = useNavigate();

// //     useEffect(() => {
// //         if (isSuccess) {
// //             navigate("/dash/transactions");
// //         }
// //     }, [isSuccess, navigate]);

// //     const formSubmit = (e) => {
// //         e.preventDefault();
// //         const data = new FormData(e.target);
// //         const transactionObj = Object.fromEntries(data.entries());
        
// //         // הוספת phone של הסוכן
// //         const newTransaction = {
// //             ...transactionObj,
// //             phone: agentPhone
// //         };

// //         console.log(newTransaction);
// //         addTransaction({ phone: agentPhone, transaction: newTransaction });
// //     };

// //     return (
// //         <div className="add-transaction-container">
// //             <form onSubmit={formSubmit} className="add-transaction-form">
// //                 <input type="text" name="customer" placeholder="מזהה לקוח" required />
// //                 <input type="text" name="service" placeholder="מזהה שירות" required />
// //                 <input type="text" name="description" placeholder="תיאור השירות" required />
// //                 <input type="number" name="price" placeholder="מחיר" required />
// //                 <select name="status" required>
// //                     <option value="pendingCharge">בהמתנה לחיוב</option>
// //                     <option value="paid">שולם</option>
// //                     <option value="notPaid">לא שולם</option>
// //                 </select>
// //                 <input type="date" name="billingDay" required />
// //                 <label>
// //                     <input type="checkbox" name="alerts" defaultChecked />
// //                     הפעל התראות
// //                 </label>
// //                 <select name="typeAlerts" required>
// //                     <option value="email and phone">אימייל ופלאפון</option>
// //                     <option value="phone only">פלאפון בלבד</option>
// //                     <option value="email only">אימייל בלבד</option>
// //                     <option value="human">הודעה אנושית</option>
// //                 </select>
// //                 <select name="alertsLevel">
// //                     <option value="once">פעם אחת</option>
// //                     <option value="weekly">שבועי</option>
// //                     <option value="nudnik">נודניק</option>
// //                 </select>
// //                 <button type="submit" disabled={isLoading}>
// //                     {isLoading ? "טוען..." : "הוספת עסקה"}
// //                 </button>
// //                 {isError && <p className="error-message">{error?.data?.message || "שגיאה בהוספת העסקה"}</p>}
// //             </form>
// //         </div>
// //     );
// // };

// // export default AddTransaction;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAddTransactionMutation } from "../TransactionsApiSlice";
import useAuth from "../../../hooks/useAuth";

const AddTransaction = () => {
    const {phone,services,customers} = useAuth();
    const navigate = useNavigate();
    const [addTransaction, { isLoading, isSuccess, isError, error }] =
        useAddTransactionMutation();

    const [selectedService, setSelectedService] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState({
        description: "",
        price: "",
        billingDay: "",
        status: "pendingCharge",
        alerts: false,
        typeAlerts: "email and phone",
        alertsLevel: "once",
    });

    useEffect(() => {
        if (isSuccess) {
            navigate("/dash");
        }
    }, [isSuccess, navigate]);

    const handleServiceChange = (event) => {
        const serviceId = event.target.value;
        const service = services.find((srv) => srv._id === serviceId);
        setSelectedService(service);
    };

    const handleCustomerChange = (event) => {
        const customerId = event.target.value;
        const customer = customers.find((cust) => cust._id === customerId);
        setSelectedCustomer(customer);
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        const fieldValue = type === "checkbox" ? checked : value;
        setTransactionDetails((prev) => ({ ...prev, [name]: fieldValue }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!selectedService || !selectedCustomer) {
            alert("בחר שירות ולקוח!");
            return;
        }
        const transactionData = {
            // agent: _id,
            customer: selectedCustomer._id,
            service: selectedService._id,
            serviceName: selectedService.name,
            ...transactionDetails,
        };
        console.log(transactionData);
        addTransaction({phone, transaction:transactionData});
    };

    return (
        <div className="add-transaction-container">
            <h1>הוסף עסקה</h1>
            <form className="add-transaction-form" onSubmit={handleSubmit}>
                {/* בחירת שירות */}
                <label>בחר שירות:</label>
                <select onChange={handleServiceChange} required>
                    <option value="">-- בחר שירות --</option>
                    {services.map((service) => (
                        <option key={service._id} value={service._id}>
                            {service.name}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={() => navigate("/add-service")}>
                    הוסף שירות חדש
                </button>

                {/* בחירת לקוח */}
                <label>בחר לקוח:</label>
                <select onChange={handleCustomerChange} required>
                    <option value="">-- בחר לקוח --</option>
                    {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                            {customer.full_name}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={() => navigate("/add-customer")}>
                    הוסף לקוח חדש
                </button>

                {/* מילוי פרטים נוספים */}
                <label>תיאור:</label>
                <textarea
                    name="description"
                    value={transactionDetails.description}
                    onChange={handleInputChange}
                    required
                />
                <label>מחיר:</label>
                <input
                    type="number"
                    name="price"
                    value={transactionDetails.price}
                    onChange={handleInputChange}
                    required
                />
                <label>תאריך חיוב:</label>
                <input
                    type="date"
                    name="billingDay"
                    value={transactionDetails.billingDay}
                    onChange={handleInputChange}
                    required
                />

                {/* שדה התראות */}
                <label>
                    <input
                        type="checkbox"
                        name="alerts"
                        checked={transactionDetails.alerts}
                        onChange={handleInputChange}
                    />
                    הפעל התראות
                </label>

                {/* סוג ההתראות ורמת ההתראות */}
                {transactionDetails.alerts && (
                    <>
                        <label>סוג התראות:</label>
                        <select
                            name="typeAlerts"
                            value={transactionDetails.typeAlerts}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="email only">אימייל בלבד</option>
                            <option value="phone only">טלפון בלבד</option>
                            <option value="email and phone">
                                אימייל וטלפון
                            </option>
                        </select>

                        <label>רמת התראות:</label>
                        <select
                            name="alertsLevel"
                            value={transactionDetails.alertsLevel}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="once">פעם אחת</option>
                            <option value="weekly">שבועי</option>
                            <option value="nudnik">נודניק</option>
                        </select>
                    </>
                )}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "שולח..." : "שלח עסקה"}
                </button>
            </form>
            {isSuccess && <p className="success-message">העסקה נקלטה בהצלחה!</p>}
            {isError && <p className="error-message">{error?.data?.message}</p>}
        </div>
    );
};

export default AddTransaction;
