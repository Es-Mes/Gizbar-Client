import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddServiceMutation } from "../servicesApiSlice";
import { useDispatch } from "react-redux";
import { addServiceStore } from "../../../app/agentSlice";
import useAuth from "../../../hooks/useAuth";
import './AddService.css';

const AddService = ({ onSuccess }) => {
    const { phone } = useAuth(); // מקבל את מספר הטלפון של הסוכן
    const [addService, { isLoading, isSuccess, isError, error }] = useAddServiceMutation();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [serviceData, setServiceData] = useState({
        name: "",
        description: "",
        type: "global", // ברירת מחדל: שירות גלובלי
        hourlyPrice: "",
        globalPrice: "",
    });

    const [showSuccessMessage, setShowSuccessMessage] = useState(false); // ניהול הצגת ההודעה

    const handleChange = (e) => {
        const { name, value } = e.target;
        setServiceData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone) {
            alert("מספר הטלפון של הסוכן לא נמצא. נסה להתחבר מחדש.");
            return;
        }

        const { type, hourlyPrice, globalPrice, ...rest } = serviceData;

        const price = type === "hourly" ? hourlyPrice : globalPrice;

        try {
            const data = await addService({ phone, service: { ...rest, type, price } }).unwrap();
            console.log(data);

            if (data) {
                setShowSuccessMessage(true); // הצג הודעת הצלחה
                const services = data.data.services;
                const newService = services[services.length - 1];
                dispatch(addServiceStore(newService)); // עדכון הסטור בשירות החדש
            }

            if (onSuccess) {
                const services = data.data.services;
                const newService = services[services.length - 1];
                onSuccess(newService); // קריאה ל־onSuccess אם הוגדר
            } else {
                setTimeout(() => {
                    setShowSuccessMessage(false); // הסתר את ההודעה
                    navigate("/dash"); // נווט לעמוד השירותים
                }, 2000); // עיכוב של 2 שניות (2000ms)
            }
        } catch (err) {
            console.error("Error adding service:", err);
        }
    };

    return (
        <div className="add-service-container">
            <h1>הוסף שירות חדש</h1>
            <form onSubmit={handleSubmit} className="add-service-form">
                <label htmlFor="name">שם השירות: <span className="required-asterisk">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={serviceData.name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="description">תיאור השירות:</label>
                <textarea
                    id="description"
                    name="description"
                    value={serviceData.description}
                    onChange={handleChange}
                ></textarea>

                <label htmlFor="type">סוג השירות: <span className="required-asterisk">*</span></label>
                {[{type:'global',name:'גלובלי'},{type:'hourly',name:'לפי שעה'}].map((type) => (
                    <div key={type.type}>
                    <input
                        type="radio"
                        name="type"
                        value={type.type}
                        checked={serviceData.type === type.type}
                        onChange={handleChange}
                    />
                    {type.name}
                </div>
                ))}
                {/* <select
                    id="type"
                    name="type"
                    value={serviceData.type}
                    onChange={handleChange}
                    required
                >
                    <option value="global">גלובלי</option>
                    <option value="hourly">שעתי</option>
                </select> */}

                {serviceData.type === "hourly" && (
                    <>
                        <label htmlFor="hourlyPrice">מחיר לשעה: <span className="required-asterisk">*</span></label>
                        <input
                            type="number"
                            id="hourlyPrice"
                            name="hourlyPrice"
                            value={serviceData.hourlyPrice}
                            onChange={handleChange}
                            required
                        />
                    </>
                )}

                {serviceData.type === "global" && (
                    <>
                        <label htmlFor="globalPrice">מחיר גלובלי: <span className="required-asterisk">*</span></label>
                        <input
                            type="number"
                            id="globalPrice"
                            name="globalPrice"
                            value={serviceData.globalPrice}
                            onChange={handleChange}
                            required
                        />
                    </>
                )}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "מוסיף..." : "הוסף שירות"}
                </button>
            </form>

            {isSuccess && <p className="success-message">השירות נוסף בהצלחה!</p>}
            {isError && <p className="error-message">{error?.data?.message || "שגיאה בהוספת השירות"}</p>}
        </div>
    );
};

export default AddService;
