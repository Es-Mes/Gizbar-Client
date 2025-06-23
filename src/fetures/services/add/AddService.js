import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import { useAddServiceMutation } from "../servicesApiSlice";
import { useDispatch } from "react-redux";
import useAuth from "../../../hooks/useAuth";

const AddService = ({ onSuccess }) => {
    const { phone } = useAuth(); // מקבל את מספר הטלפון של הסוכן
    console.log(phone);

    const [addService, { isLoading, isSuccess, isError, error }] = useAddServiceMutation();
    const [message, setMessage] = useState(null)
    const [clicked,setClicked] = useState(false)
    
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
        setClicked(true);
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
                if (!data.error) {
                    toast.success("השירות נוסף בהצלחה 👍 ", { icon: false })
                    setTimeout(() => {
                        setShowSuccessMessage(false); // הסתר את ההודעה
                        onSuccess(data)
                    }, 2000); // עיכוב של 2 שניות (2000ms)
                }
            }

        } catch (err) {
            console.error("Error adding service:", err);
        }
    };

    return (
        <div className="add-service-container">
            <div className="modelTitle">
                <h1>הוסף שירות חדש</h1>
                <div className="add-client-icon" style={{ fontSize: "3rem" }}><img src="/icons8-briefcase-50.png"/></div>
            </div>
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
                {[{ type: 'global', name: 'גלובלי' }, { type: 'hourly', name: 'לפי שעה' }].map((type) => (
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

                <button type="submit" disabled={clicked}>
                    {isLoading ? "מוסיף..." : "הוסף שירות"}
                </button>
            </form>

            {message && <p style={{ color: "#f9a825" }}>{message}</p>}
            {isError && <p className="error-message">{error?.data?.message || "שגיאה בהוספת השירות"}</p>}
        </div>
    );
};

export default AddService;
