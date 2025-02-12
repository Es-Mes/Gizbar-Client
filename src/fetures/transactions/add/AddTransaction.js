
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAddTransactionMutation } from "../TransactionsApiSlice";
import { useGetAllServicesQuery } from "../../services/servicesApiSlice";
import { useGetAllCustomersQuery } from "../../customers/customersApiSlice";
import { addTransactionStore } from "../../../app/agentSlice";
import useAuth from "../../../hooks/useAuth";
import AddCustomer from "../../customers/add/AddCustomer";
import AddService from "../../services/add/AddService";
import Modal from "../../../modals/Modal";
import "./AddTransaction.css"
import { addNewTransaction, setError } from "../../../app/transactionsSlice";
const AddTransaction = ({ onSuccess }) => {
    const { _id, phone } = useAuth();
    const services = useSelector((state) => state.agent?.data?.services || []);
    const filterServices = services.filter((service) => service.active === true);
    const customers = useSelector((state) => state.agent?.data?.customers || []);
    const { refetch: refetchCustomers } = useGetAllCustomersQuery({ phone });
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const [addTransaction, { isLoading, isSuccess, isError, error, data }] =
        useAddTransactionMutation();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState({
        // description: "",
        // price: 0,
        // pricePerHour: "",
        // serviceType: "global",
        // hours: 0,
        billingDay: "",
        alerts: false,
        // typeAlerts: "email and phone",
        // alertsLevel: "once",
    });

    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const types = {
        global: 'גלובלי',
        hourly: 'לפי שעה'
    }
    useEffect(() => {
        if (isSuccess) {
            setMessage("העסקה נוספה בהצלחה!");
            setMessageType("success");
            setTimeout(() => navigate("/dash"), 2000);
        } else if (isError) {
            setMessage("");
            console.log('error', error)
            console.log('data', data)
            setMessage("שגיאה בהוספת העסקה. נסה שוב.");
            setMessageType("error");
        }
    }, [isSuccess, isError, navigate]);

    useEffect(() => {
        if (isSuccess) {
            navigate("/dash");
        }
    }, [isSuccess, navigate]);

    //עדכון המחיר הגלובלי
    const updatePrice = () => {
        console.log('transaction details before update price: ', transactionDetails);

        setTransactionDetails((prev) => ({
            ...prev,
            price: selectedService.serviceType === "global"
                ? Number(prev.price) || 0
                : Number(prev.pricePerHour) * Number(prev.hours) || 0
        }));
        console.log('transaction details after update price: ', transactionDetails);
    }

    const handleServiceChange = (event) => {
        const serviceId = event.target.value;
        const service = services.find((srv) => srv._id === serviceId);
        setSelectedService(service);
        if (service) {
            setTransactionDetails((prev) => ({
                ...prev,
                service: service._id,
                serviceType: service.type,
                description: service.description
            }));
            if (service.type === 'hourly') {
                setTransactionDetails((prev) => ({
                    ...prev,
                    pricePerHour: service.price
                }));
            } else {
                setTransactionDetails((prev) => ({
                    ...prev,
                    price: service.price
                }));
            }
        };
    }
    const handleCustomerChange = (event) => {
        const customerId = event.target.value;
        const customer = customers.find((cust) => cust._id === customerId);
        setSelectedCustomer(customer);
        if (customer) {
            setTransactionDetails((prev) => ({
                ...prev,
                customer: customer._id
            }));
        }
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        const fieldValue = type === "checkbox" ? checked : value;

        setTransactionDetails((prev) => {
            let updatedDetails = {
                ...prev,
                [name]: fieldValue,
            };

            if (selectedService?.type === "hourly" && (name === "hours" || name === "pricePerHour")) {
                updatedDetails.price = Number(updatedDetails.pricePerHour) * Number(updatedDetails.hours) || 0;
            }

            if (name === "alerts") {
                updatedDetails = {
                    ...updatedDetails,
                    alerts: fieldValue,
                    typeAlerts: fieldValue ? "email and phone" : "",
                    alertsLevel: fieldValue ? "once" : "",
                };
            };
            return updatedDetails;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!transactionDetails.billingDay) {
            alert("יש לבחור תאריך חיוב");
            return;
        }
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

        try {
            console.log("transactionData before sending:", transactionDetails);
            const transaction = await addTransaction({ phone, transaction: transactionDetails }).unwrap();

            console.log(transaction);

            if (transaction && !transaction.error) {
                const customerDetails = customers.find(c => c._id === transaction.data.customer) || null;

                const transactionWhithCustomer = {
                    ...transaction.data,
                    customer: customerDetails
                };
                console.log(transactionWhithCustomer);

                dispatch(addNewTransaction(transactionWhithCustomer));
            } else {
                dispatch(setError(transaction.message));
            }



            onSuccess()

        } catch (err) {
            console.error("Error adding transaction:", err);
        }

    };


    const nextStep = () => {
        if (currentStep === 1 && !selectedService) {
            alert("יש לבחור שירות לפני המעבר לשלב הבא.");
            return;
        }
        if (currentStep === 1 && selectedService.type === "hourly" && transactionDetails.hours < 1) {
            alert("יש לבחור מספר שעות לפני המעבר לשלב הבא.");
            return;
        }
        if (currentStep === 1) {
            // updatePrice()
            console.log(transactionDetails);
            if (!transactionDetails.price) {
                alert("יש להכניס מחיר לפני המעבר לשלב הבא.");
                return;
            }
        }
        if (currentStep === 2 && !selectedCustomer) {
            alert("יש לבחור לקוח לפני המעבר לשלב הבא.");
            return;
        }
        setCurrentStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
    };

    return (
        <div className="add-transaction-card">
            <div className="transaction-header">
                <h3>הוספת עסקה</h3>
                {/* <button className="close-button" onClick={() => navigate("/dash")}>&times;</button> */}
            </div>
            {currentStep === 1 && (
                <div className="transaction-body">
                    <label htmlFor="service">בחר שירות: <span className="required-asterisk">*</span></label>
                    <select id="service" onChange={handleServiceChange} required>
                        <option value="">-- בחר שירות --</option>
                        {filterServices.map((service) => (
                            <option key={service._id} value={service._id}>
                                {service.name}
                            </option>
                        ))}
                    </select>
                    <button className="add-button" type="button" onClick={() => { setServiceModalOpen(true); console.log({ isServiceModalOpen }) }}>
                        + הוסף שירות חדש
                    </button>
                    {selectedService && (
                        <div>
                            <label >סוג שירות: {types[selectedService.type]}</label>
                            {/* <label htmlFor="description">תיאור:</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={transactionDetails.description || selectedService.description}
                                onChange={handleInputChange}
                            /> */}
                            {(selectedService.type === 'global') &&
                                (<div>
                                    <label htmlFor="price">מחיר:<span className="required-asterisk">*</span></label>
                                    <input
                                        type="Number"
                                        id="price"
                                        name="price"
                                        value={transactionDetails.price || selectedService.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>)}
                            {(selectedService.type === "hourly") &&
                                (<div>
                                    <label htmlFor="pricePerHour">מחיר לשעה:<span className="required-asterisk">*</span></label>
                                    <input
                                        type="Number"
                                        id="pricePerHour"
                                        name="pricePerHour"
                                        value={transactionDetails.pricePerHour || selectedService.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <label htmlFor="hours">מספר שעות עבודה:<span className="required-asterisk">*</span></label>
                                    <input
                                        type="Number"
                                        id="hours"
                                        name="hours"
                                        value={transactionDetails.hours}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>)}
                        </div>
                    )}
                </div>
            )}

            {currentStep === 2 && (
                <div className="transaction-body">
                    <label htmlFor="customer">בחר לקוח: <span className="required-asterisk">*</span></label>
                    <select id="customer" onChange={handleCustomerChange} required>
                        <option value="">-- בחר לקוח --</option>
                        {customers.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                                {customer.full_name}
                            </option>
                        ))}
                    </select>
                    <button className="add-button" type="button" onClick={() => { setCustomerModalOpen(true); console.log({ isCustomerModalOpen }); }}>
                        + הוסף לקוח חדש
                    </button>
                    {selectedCustomer && (
                        <div>
                            <p>שם: {selectedCustomer.full_name}</p>
                            <p>טלפון: {selectedCustomer.phone}</p>
                            <p>כתובת: {selectedCustomer.address}</p>
                        </div>
                    )}
                </div>
            )}

            {currentStep === 3 && (
                <div className="transaction-body">
                    <label>סכום עסקה:</label>
                    <p className="transaction-price">{transactionDetails.price} ₪</p>
                    <label htmlFor="description">תיאור:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={transactionDetails.description}
                        onChange={handleInputChange}
                    />
                    <label htmlFor="billingDay">תאריך חיוב: <span className="required-asterisk">*</span></label>
                    <input
                        type="date"
                        id="billingDay"
                        name="billingDay"
                        value={transactionDetails.billingDay}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="alerts">הפעל התראות
                        <input
                            type="checkbox"
                            id="alerts"
                            name="alerts"
                            checked={transactionDetails.alerts}
                            onChange={handleInputChange}
                        />

                    </label>

                    {transactionDetails.alerts && (
                        <div className="stepBox">
                            <label>סוג התראות:</label>
                            {[
                                { value: 'email only', name: 'מייל בלבד' },
                                { value: 'phone only', name: 'טלפון בלבד' },
                                { value: 'email and phone', name: 'מייל וטלפון' },
                                { value: 'human', name: 'אנושי' },
                            ].map((type) => (
                                <div key={type.value}>
                                    <input
                                        type="radio"
                                        name="typeAlerts"
                                        value={type.value}
                                        checked={transactionDetails.typeAlerts === type.value}
                                        onChange={handleInputChange}
                                    />
                                    {type.name}
                                </div>
                            ))}

                            <label>רמת התראות:</label>
                            {[
                                { value: 'once', name: 'פעם אחת' },
                                { value: 'weekly', name: 'שבועי' },
                                { value: 'nudnik', name: 'נודניק' }
                            ].map((level) => (
                                <div key={level.value}>
                                    <input
                                        type="radio"
                                        name="alertsLevel"
                                        value={level.value}
                                        checked={transactionDetails.alertsLevel === level.value}
                                        onChange={handleInputChange}
                                    />
                                    {level.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="navigation-buttons">
                {currentStep > 1 && <button className="navigation-buttons" onClick={prevStep}>חזור</button>}
                {currentStep < 3 && <button className="navigation-buttons" onClick={() => nextStep()}>הבא</button>}
                {currentStep === 3 && (
                    <button className="submit-button" type="submit" onClick={handleSubmit}>
                        סיים
                    </button>
                )}
                {message && <p className={`message ${messageType}`}>{message}</p>}
            </div>


            <Modal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)}>
                <AddCustomer
                    onSuccess={(newCustomer) => {

                        refetchCustomers();
                        setSelectedCustomer(newCustomer); // עדכון אוטומטי של הלקוח הנבחר
                        setCustomerModalOpen(false);
                        // קריאה יזומה לפונקציה שמטפלת בבחירת לקוח
                        handleCustomerChange({ target: { value: newCustomer._id } });
                    }}
                />
            </Modal>



            <Modal isOpen={isServiceModalOpen} onClose={() => setServiceModalOpen(false)}>
                <AddService
                    onSuccess={(newService) => {
                        console.log(newService);
                        // Handle successful service addition if necessary
                        setSelectedService(newService); // עדכון השירות הנבחר

                        setServiceModalOpen(false);
                        // קריאה יזומה לפונקציה שמטפלת בבחירת שירות
                        handleServiceChange({ target: { value: newService._id } });
                    }}
                />
            </Modal>

        </div>
    );
};

export default AddTransaction;