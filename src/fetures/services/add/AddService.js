import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddServiceMutation } from "../servicesApiSlice";
import useAuth from "../../../hooks/useAuth";

const AddService = () => {
    const { phone } = useAuth(); // מקבל את מספר הטלפון של הסוכן
    const [addService, { isLoading, isSuccess, isError, error }] = useAddServiceMutation();
    const navigate = useNavigate();

    const [serviceData, setServiceData] = useState({
        name: "",
        description: "",
        price: "",
    });

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

        try {
            await addService({ phone, service: serviceData }).unwrap();
            alert("השירות נוסף בהצלחה!");
            navigate("/services"); // נווט חזרה לעמוד השירותים
        } catch (err) {
            console.error("Error adding service:", err);
        }
    };

    return (
        <div className="add-service-container">
            <h1>הוסף שירות חדש</h1>
            <form onSubmit={handleSubmit} className="add-service-form">
                <label htmlFor="name">שם השירות:</label>
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

                <label htmlFor="price">מחיר:</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={serviceData.price}
                    onChange={handleChange}
                    required
                />

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