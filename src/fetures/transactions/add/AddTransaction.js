
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify';

import { useAddTransactionMutation } from "../TransactionsApiSlice";
import useAuth from "../../../hooks/useAuth";
import AddCustomer from "../../customers/add/AddCustomer";
import AddService from "../../services/add/AddService";
import Modal from "../../../modals/Modal";
import "./AddTransaction.css"
import { useGetAgentQuery } from "../../agent/apiSlice";
import StepIndicator from "./StepIndicator";
import PaymentDetails from "../../../component/payment/paymentDetails";
import { TextField, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import HebrewDatePicker from "../../../component/date/HebrewDatePicker";
const AddTransaction = ({ onSuccess, specificCustomer }) => {
    const { _id, phone } = useAuth();
    const { data: agent, isLoading } = useGetAgentQuery({ phone })

    const services = agent?.services || [];
    const filterServices = services.filter((service) => service.active === true);
    const customers = agent?.customers || [];

    const navigate = useNavigate();
    const [addTransaction, { isSuccess, isError, error, data }] =
        useAddTransactionMutation();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState({
        billingDay: "",
        alerts: true,
        typeAlerts: "email and phone",
        alertsLevel: "once",
    });
    const [serviceType, setServiceType] = useState('רגיל');
    const [months, setMonths] = useState('');
    const [chargeDay, setChargeDay] = useState('');

    const [isBankAccountModalOpen, setBankAccountModalOpen] = useState(false)
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
            toast.success("👍 העיסקה נוספה בהצלחה", { icon: false });
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
        console.log(`serviceId : ${serviceId}`);

        const service = services.find((srv) => srv._id === serviceId);
        console.log(service);
        if (service) {
            setSelectedService(service);

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


            // setCurrentStep((prev) => prev + 1);
        };
    }
    useEffect(() => {
        if (specificCustomer && customers.length > 0) {
            const customer = customers.find((cust) => cust._id === specificCustomer);
            if (customer) {
                setSelectedCustomer(customer);
                setTransactionDetails(prev => ({
                    ...prev,
                    customer: customer._id
                }));
            }
        }
    }, [specificCustomer, customers]);


    const handleCustomerChange = (event) => {
        const customerId = event.target.value;
        const customer = customers.find((cust) => cust._id === customerId);
        if (customer) {
            setSelectedCustomer(customer);
            setTransactionDetails((prev) => ({
                ...prev,
                customer: customer._id
            }));
            // setCurrentStep((prev) => prev + 1);
        }


        // setCurrentStep((prev) => prev + 1);

    };



    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        const fieldValue = type === "checkbox" ? checked : value;

        setTransactionDetails((prev) => {
            let updatedDetails = {
                ...prev,
                [name]: fieldValue,
            };

            // עדכון מחיר לעסקה לפי שעה
            if (selectedService?.type === "hourly" && (name === "hours" || name === "pricePerHour")) {
                updatedDetails.price = Number(updatedDetails.pricePerHour) * Number(updatedDetails.hours) || 0;
            }

            // עדכון שדות התראות
            if (name === "alerts") {
                updatedDetails = {
                    ...updatedDetails,
                    alerts: fieldValue,
                    typeAlerts: fieldValue ? "email and phone" : "",
                    alertsLevel: fieldValue ? "once" : "",
                };
            }

            return updatedDetails;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage(" ");

        // בדיקות תקינות בסיסיות
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

        // בדיקות עבור הוראת קבע (חודשי)
        if (serviceType === "חודשי") {
            if (months && (isNaN(Number(months)) || Number(months) < 1)) {
                setMessage("יש להזין מספר חודשים תקין (1 ומעלה) או להשאיר ריק ללא הגבלה");
                return;
            }
            if (!chargeDay || isNaN(Number(chargeDay)) || Number(chargeDay) < 1 || Number(chargeDay) > 31) {
                setMessage("יש להזין יום גבייה תקין (1-31)");
                return;
            }
        }

        // חישוב סכומים ומספר תשלומים
        let amount, tashlumim, day;
        if (serviceType === "חודשי") {
            // הוראת קבע: סכום חודשי, מספר חודשים, יום גבייה
            amount = selectedService?.type === "hourly"
                ? Number(transactionDetails.pricePerHour) * Number(transactionDetails.hours || 1)
                : Number(transactionDetails.price);

            tashlumim = months || ""; // ריק = ללא הגבלה
            day = chargeDay || undefined;
        } else {
            // רגיל: סכום כולל, מספר תשלומים
            amount = selectedService?.type === "hourly"
                ? Number(transactionDetails.pricePerHour) * Number(transactionDetails.hours || 1)
                : Number(transactionDetails.price);

            tashlumim = 1; // אפשר להרחיב לשדה תשלומים בעתיד
            day = undefined;
        }

        const paymentType = serviceType === "חודשי" ? "HK" : "Ragil";

        // בניית אובייקט לשליחה
        const transactionToSend = {
            ...transactionDetails,
            paymentType,
            amount,
            tashlumim,
            day,
        };

        try {
            nextStep();
            setClicked(true);
            console.log("transactionData before sending:", transactionToSend);
            const transaction = await addTransaction({ phone, transaction: transactionToSend }).unwrap();

            if (transaction && !transaction.error) {
                const customerDetails = customers.find(c => c._id === transaction.data.customer) || null;

                const transactionWhithCustomer = {
                    ...transaction.data,
                    customer: customerDetails
                };
                console.log(transactionWhithCustomer);
            }

            onSuccess();

        } catch (err) {
            console.error("Error adding transaction:", err);
        }
    };






    const nextStep = () => {
        setMessage("");
        if (currentStep === 2 && !selectedService) {
            setMessage("יש לבחור שירות לפני המעבר לשלב הבא");
            return;
        }
        if (currentStep === 2 && selectedService.type === "hourly" && transactionDetails.hours < 1) {
            setMessage("יש לבחור מספר שעות לפני המעבר לשלב הבא");
            return;
        }
        if (currentStep === 2) {
            // updatePrice()
            console.log(transactionDetails);
            if (!transactionDetails.price) {
                setMessage("יש להכניס מחיר לפני המעבר לשלב הבא");
                return;
            }
        }
        if (currentStep === 1 && !selectedCustomer) {
            setMessage("יש לבחור לקוח לפני המעבר לשלב הבא");
            return;
        }
        setCurrentStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setMessage("");
        setCurrentStep((prev) => prev - 1);
    };

    // עסקה פעם ראשונה או שאין פרטי בנק
    // if (!agent?.cardDetails || agent?.cardDetails.length === 0) {
    //     return(
    //         <PaymentDetails onSuccess={onSuccess}/>)
    // }



    return (
        (!agent?.cardDetails || agent?.cardDetails.length === 0) ?
            <PaymentDetails />
            :
            (<div className="add-transaction-card">
                <div className="transaction-header">
                    {/* <div className="rotating-coin">🪙</div> */}
                    <h2>הוספת עסקה חדשה</h2>

                    {/* <button className="close-button" onClick={() => navigate("/dash")}>&times;</button> */}
                </div>
                <StepIndicator currentStep={currentStep - 1} />
                {currentStep === 1 && (
                    <div className="transaction-body">
                        <FormControl fullWidth variant="outlined" margin="normal">
                            <InputLabel id="customer-label">בחר לקוח</InputLabel>
                            <Select
                                labelId="customer-label"
                                id="customer"
                                value={transactionDetails.customer || ""}
                                onChange={handleCustomerChange}
                                label="בחר לקוח"
                                required
                            >
                                <MenuItem value="">
                                    {selectedCustomer ? selectedCustomer.full_name : "--  בחר לקוח קיים --"}
                                </MenuItem>
                                {customers.map((customer) => (
                                    <MenuItem key={customer._id} value={customer._id}>
                                        {customer.full_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                            )}
                        </div>
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="transaction-body">
                        <FormControl fullWidth variant="outlined" margin="normal">
                            <InputLabel id="service-label">בחר שירות</InputLabel>
                            <Select
                                labelId="service-label"
                                id="service"
                                value={transactionDetails.service || ""}
                                onChange={handleServiceChange}
                                label="בחר שירות"
                                required
                            >
                                <MenuItem value="">-- בחר שירות קיים --</MenuItem>
                                {filterServices.map((service) => (
                                    <MenuItem key={service._id} value={service._id}>
                                        {service.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <button className="add-button" type="button" onClick={() => { setServiceModalOpen(true); console.log({ isServiceModalOpen }) }}>
                            + הוסף שירות חדש
                        </button>
                        {selectedService && (
                            <div className="serviceRowBox">
                                <FormControl fullWidth variant="outlined" margin="normal">
                                    <InputLabel id="service-type-label">סוג שירות</InputLabel>
                                    <Select
                                        labelId="service-type-label"
                                        value={serviceType}
                                        onChange={e => setServiceType(e.target.value)}
                                        label="סוג שירות"
                                    >
                                        <MenuItem value="רגיל">רגיל</MenuItem>
                                        <MenuItem value="חודשי">חודשי</MenuItem>
                                    </Select>
                                </FormControl>
                                {serviceType === "חודשי" && (
                                    <>
                                        <TextField label="מספר חודשים" type="number" value={months} onChange={e => setMonths(e.target.value)} min="1" />
                                        <TextField label="יום גבייה בחודש" type="number" value={chargeDay} onChange={e => setChargeDay(e.target.value)} min="1" max="31" />
                                    </>
                                )}
                                {(selectedService.type === "hourly") &&
                                    (<div className="perHourBox">
                                        <div>
                                            <label htmlFor="pricePerHour">מחיר לשעה:<span className="required-asterisk">*</span></label>
                                            <TextField variant="outlined"
                                                type="Number"
                                                id="pricePerHour"
                                                name="pricePerHour"
                                                value={transactionDetails.pricePerHour || selectedService.price}
                                                onChange={handleInputChange}
                                                required
                                            /></div>
                                        <div>
                                            <label htmlFor="hours">מספר שעות עבודה:<span className="required-asterisk">*</span></label>
                                            <TextField variant="outlined"
                                                type="Number"
                                                id="hours"
                                                name="hours"
                                                value={transactionDetails.hours}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
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
                                <TextField variant="outlined"
                                    type="date"
                                    id="billingDay"
                                    name="billingDay"
                                    value={transactionDetails.billingDay}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="field-group date">
                                <HebrewDatePicker
                                    name="billingDay"
                                    value={transactionDetails.billingDay}
                                    onChange={handleInputChange}
                                    required
                                    label="תאריך חיוב"
                                />                            </div>



                        </div>

                        <div className="field-group full-width">
                            <TextField variant="outlined"
                                id="description"
                                name="description"
                                label='תיאור'
                                value={transactionDetails.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field-group full-width"> <label htmlFor="alerts">הפעל התראות
                            <input className="noFocus"
                                style={{ marginRight: '10px' }}
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
                                {[
                                    ...(selectedCustomer?.email
                                        ? [
                                            { value: 'email and phone', name: 'מייל וטלפון' },
                                            { value: 'email only', name: 'מייל בלבד' }
                                        ]
                                        : []),
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
                    {message && <p className={`message ${messageType}`} style={{ color: "#f9a825" }}>{message}</p>}

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
                {/* <Modal isOpen={isBankAccountModalOpen} onClose={() => {setBankAccountModalOpen(false)}}>
                bankAccount
            </Modal> */}

            </div>)
    );
};

export default AddTransaction;