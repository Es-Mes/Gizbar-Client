import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import { useAddServiceMutation } from "../servicesApiSlice";
import { useDispatch } from "react-redux";
import useAuth from "../../../hooks/useAuth";
import { TextField } from "@mui/material";

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
                
                <TextField
                 variant="outlined"
                    type="text"
                    id="name"
                    name="name"
                    label='שם השירות'
                    value={serviceData.name}
                    onChange={handleChange}
                    required
                />

                <TextField
                variant="outlined"
                    id="description"
                    name="description"
                    label="תאור השירות"
                    value={serviceData.description}
                    onChange={handleChange}
                />

                <div style={{display:'flex',minWidth:'100%',justifyContent:'start',gap:'20px'}}>
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
                            <p>{type.name}</p>
                        </div>
                    ))}
                </div>

                {serviceData.type === "hourly" && (
                    
                        <TextField variant="outlined"
                            type="number"
                            id="hourlyPrice"
                            name="hourlyPrice"
                            value={serviceData.hourlyPrice}
                            onChange={handleChange}
                            label='מחיר לשעה'
                            required
                        />
                  
                )}

                {serviceData.type === "global" && (
                    
                        <TextField variant="outlined"
                            type="number"
                            id="globalPrice"
                            name="globalPrice"
                            label='מחיר גלובלי'
                            value={serviceData.globalPrice}
                            onChange={handleChange}
                            required
                        />
                    
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
