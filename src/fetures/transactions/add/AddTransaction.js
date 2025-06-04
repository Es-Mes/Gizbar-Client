
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAddTransactionMutation } from "../TransactionsApiSlice";
import useAuth from "../../../hooks/useAuth";
import AddCustomer from "../../customers/add/AddCustomer";
import AddService from "../../services/add/AddService";
import Modal from "../../../modals/Modal";
import "./AddTransaction.css"
import { useGetAgentQuery } from "../../../app/apiSlice";
import StepIndicator from "./StepIndicator";
const AddTransaction = ({ onSuccess,specificCustomer }) => {
    const { _id, phone } = useAuth();
    const { data: agent, isLoading } = useGetAgentQuery({ phone })
    const services = agent?.services || [];
    const filterServices = services.filter((service) => service.active === true);
    const customers = agent?.customers || [];

    const navigate = useNavigate();
    const [addTransaction, { isSuccess, isError, error, data }] =
        useAddTransactionMutation();

    const [currentStep, setCurrentStep] = useState(1);
    const [step, setStep] = useState(0); // 0 - פרטי הלקוח, 1 - פרטי העסקה, 2 - פרטי הגביה
    const [selectedService, setSelectedService] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState({
        billingDay: "",
        alerts: false,
    });

    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [clicked, setClicked] = useState(false);

    const types = {
        global: 'גלובלי',
        hourly: 'לפי שעה'
    }
    useEffect(() => {
        if (isSuccess) {
            setMessage("העסקה נוספה בהצלחה!");
            setMessageType("success");
            // setTimeout(() => navigate("/dash"), 2000);
            onSuccess()
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
            onSuccess()
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
            setCurrentStep((prev) => prev + 1);
        };
    }
    const handleCustomerInput = () => {
        const customerId = specificCustomer;
        const customer = customers.find((cust) => cust._id === customerId);
        setSelectedCustomer(customer);
        
    };
    useEffect(() => {
        handleCustomerInput()
    },[])
    const handleCustomerChange = (event) => {
        const customerId = event.target.value;
        const customer = customers.find((cust) => cust._id === customerId);
        setSelectedCustomer(customer);
        if (customer) {
            setTransactionDetails((prev) => ({
                ...prev,
                customer: customer._id
            }));
            setCurrentStep((prev) => prev + 1);
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
        setMessage(" ");
        if (!transactionDetails.billingDay) {
            setMessage("יש לבחור תאריך חיוב");
            return;
        }
        if (!selectedService || !selectedCustomer) {
            setMessage("בחר שירות ולקוח!");
            return;
        }
        if (
            transactionDetails.alerts &&
            (!transactionDetails.typeAlerts || !transactionDetails.alertsLevel)
        ) {
            setMessage("בחר סוג ורמת התראות!");
            return;
        }

        try {
            nextStep()
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
            }
            setClicked(true);
            onSuccess()

        } catch (err) {
            console.error("Error adding transaction:", err);
        }

    };


    const nextStep = () => {
        setMessage("");
        if (currentStep === 2 && !selectedService) {
            setMessage("יש לבחור שירות לפני המעבר לשלב הבא.");
            return;
        }
        if (currentStep === 2 && selectedService.type === "hourly" && transactionDetails.hours < 1) {
            setMessage("יש לבחור מספר שעות לפני המעבר לשלב הבא.");
            return;
        }
        if (currentStep === 2) {
            // updatePrice()
            console.log(transactionDetails);
            if (!transactionDetails.price) {
                setMessage("יש להכניס מחיר לפני המעבר לשלב הבא.");
                return;
            }
        }
        if (currentStep === 1 && !selectedCustomer) {
            setMessage("יש לבחור לקוח לפני המעבר לשלב הבא.");
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
                <h3>הוספת עסקה חדשה</h3>

                {/* <button className="close-button" onClick={() => navigate("/dash")}>&times;</button> */}
            </div>
            <StepIndicator currentStep={currentStep - 1} />
            {currentStep === 1 && (
                <div className="transaction-body">
                    <label htmlFor="customer">בחר לקוח: <span className="required-asterisk">*</span></label>
                    <select id="customer" onChange={handleCustomerChange} value={transactionDetails.customer} required>
                        <option value="">{selectedCustomer? selectedCustomer.full_name : "--  בחר לקוח קיים --"}</option>
                        {customers.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                                {customer.full_name}
                            </option>
                        ))}
                    </select>
                    <button className="add-button" type="button" onClick={() => { setCustomerModalOpen(true); console.log({ isCustomerModalOpen }); }}>
                        + הוסף לקוח חדש
                    </button>
                    <div className="customerDetayls">
                        {selectedCustomer && (

                            <div>
                                <div className="row">
                                    <h4>שם:</h4><p>{selectedCustomer.full_name}</p>
                                </div>
                                <div className="row">
                                    <h4>טלפון:</h4><p>{selectedCustomer.phone}</p>
                                </div>
                                <div className="row">
                                    <h4>אימייל:</h4><p>{selectedCustomer.email}</p>
                                </div>
                                <div className="row">
                                    <h4>כתובת:</h4><p>{selectedCustomer.address}</p>
                                </div>
                            </div>
                        )}</div>

                </div>
            )}
            {currentStep === 2 && (
                <div className="transaction-body">
                    <label htmlFor="service">בחר שירות: <span className="required-asterisk">*</span></label>
                    <select id="service" onChange={handleServiceChange} value={transactionDetails.service} required>
                        <option value="">-- בחר שירות קיים --</option>
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
                        <div className="serviceRowBox">
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



            {currentStep === 3 && (
                <div className="transaction-body">
                    <div className="transaction-row">
                        <div className="field-group transaction-amount">
                            <label>סכום עסקה:</label>
                            <p className="transaction-price">{transactionDetails.price} ₪</p>
                        </div>

                        <div className="field-group date">
                            <label htmlFor="billingDay">
                                תאריך חיוב: <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="date"
                                id="billingDay"
                                name="billingDay"
                                value={transactionDetails.billingDay}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="field-group full-width">
                        <label htmlFor="description">תיאור:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={transactionDetails.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group full-width"> <label htmlFor="alerts">הפעל התראות
                        <input className="noFocus"
                            type="checkbox"
                            id="alerts"
                            name="alerts"
                            checked={transactionDetails.alerts}
                            onChange={handleInputChange}
                        />

                    </label>
                    </div>




                    {transactionDetails.alerts && (
                        <div className="stepBox">
                            <label>סוג:</label>
                            {[{ value: 'email and phone', name: 'מייל וטלפון' },
                            { value: 'email only', name: 'מייל בלבד' },
                            { value: 'phone only', name: 'טלפון בלבד' },
                            { value: 'human', name: 'אנושי' },
                            ].map((type) => (
                                <div className="alertRow" key={type.value}>
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

                            <label>רמה:</label>
                            {[
                                { value: 'once', name: 'פעם אחת' },
                                { value: 'weekly', name: 'שבועי' },
                                { value: 'nudnik', name: 'נודניק' }
                            ].map((level) => (
                                <div className="alertRow" key={level.value}>
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
                <div className="nav-left">
                    {currentStep > 1 && (
                        <button className="navButton" onClick={prevStep}>חזור</button>
                    )}
                </div>
                {message && <p className={`message ${messageType}`}>{message}</p>}

                <div className="nav-right">
                    {currentStep < 3 && (
                        <button className="navButton" onClick={nextStep}>הבא</button>
                    )}
                    {currentStep === 3 && (
                        <button className="submit-button navButton" type="submit" onClick={handleSubmit} disabled={clicked}>
                            סיים
                        </button>
                    )}
                </div>

            </div>



            <Modal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)}>
                <AddCustomer
                    onSuccess={(newCustomer) => {

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