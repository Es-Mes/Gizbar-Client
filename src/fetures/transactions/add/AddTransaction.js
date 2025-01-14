import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAddTransactionMutation } from "../TransactionsApiSlice";
// import { useGetAllServicesQuery } from "../../services/servicesApiSlice";
import { useGetAllCustomersQuery } from "../../customers/customersApiSlice";

import useAuth from "../../../hooks/useAuth";
import AddCustomer from "../../customers/add/AddCustomer";
import AddService from "../../services/add/AddService";
import Modal from "../../../modals/Modal";

const AddTransaction = () => {
    const { phone} = useAuth();
    const services = useSelector((state) => state.agent?.data?.data?.services || []);
    const customers = useSelector((state) =>state.agent?.data?.data?.customers || [])
    const { refetch: refetchCustomers } = useGetAllCustomersQuery({ phone });
    // const { refetch: refetchServices } = useGetAllServicesQuery({ phone });

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

    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            navigate("/dash");
        }
    }, [isSuccess, navigate]);
    // useEffect(() => {
    //     console.log("Customers updated:", customers);
    // }, [customers]);
    
    // useEffect(() => {
    //     console.log("Services updated:", services);
    // }, [services]);

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
    
        setTransactionDetails((prev) => {
            // אם סוג השדה הוא "alerts" (התראות)
            if (name === "alerts") {
                return {
                    ...prev,
                    alerts: fieldValue,
                    typeAlerts: fieldValue ? "email and phone" : "",
                    alertsLevel: fieldValue ? "once" : "",
                };
            }
            // עדכון רגיל לכל שאר השדות
            return {
                ...prev,
                [name]: fieldValue,
            };
        });
    };
    

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!selectedService || !selectedCustomer) {
            alert("בחר שירות ולקוח!");
            return;
        }
        if (
            transactionDetails.alerts &&
            (!transactionDetails.typeAlerts || !transactionDetails.alertsLevel)
        ) {
            alert("בחר סוג ורמת התראות!");
            return;
        }
        const transactionData = {
            customer: selectedCustomer._id,
            service: selectedService._id,
            serviceName: selectedService.name,
            ...transactionDetails,
        };
        console.log(transactionData);
        addTransaction({ phone, transaction: transactionData });
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
                <button type="button" onClick={() => setServiceModalOpen(true)}>
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
                <button type="button" onClick={() => setCustomerModalOpen(true)}>
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

            {/* מודל הוספת לקוח */}
            <Modal
                isOpen={isCustomerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
            >
                <AddCustomer
                onSuccess={() =>{
                     refetchCustomers(); // רענון הלקוחות
                    setCustomerModalOpen(false);
                    }} />
            </Modal>

            {/* מודל הוספת שירות */}
            <Modal
                isOpen={isServiceModalOpen}
                onClose={() => setServiceModalOpen(false)}
            >
                <AddService
                onSuccess={() => {
                    setServiceModalOpen(false); // סגור את המודל
                }} />
            </Modal>
        </div>
    );
};

export default AddTransaction;
