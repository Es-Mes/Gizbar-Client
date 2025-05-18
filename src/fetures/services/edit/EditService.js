import React, { useState, useEffect } from 'react';
import { useUpdateServiceMutation } from '../servicesApiSlice';
import { useDispatch } from 'react-redux';
import useAuth from '../../../hooks/useAuth';
import './editService.css'

const EditService = ({ service, onSuccess }) => {

    const { phone } = useAuth()
    const [updatedService, { isLoading }] = useUpdateServiceMutation();

    const [editedservice, setEditedService] = useState({
        _id: service._id,
        name: service.name,
        description: service.description,
        type: service.type,
        price: service.price,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedService((prevService) => ({
            ...prevService,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Save the updated service details
        if (!phone) {
            alert("מזהה הסוכן לא נמצא. נסה להתחבר מחדש.");
            return;
        }

        try {
            const data = await updatedService({ phone, service: editedservice }).unwrap();
            console.log(data);
            if (data) { 
                onSuccess();
            }
        } catch (err) {
            console.error('Error update service: ', err)
        }
    };

    return (
        <div className='edit-service-container'>
            <h1>עריכת שירות</h1>
            <form onSubmit={handleSubmit} className='edit-service-form'>
                <label htmlFor="name">שם השירות: <span className="required-asterisk">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={editedservice.name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="description">תיאור השירות:</label>
                <textarea
                    id="description"
                    name="description"
                    value={editedservice.description}
                    onChange={handleChange}
                />

                <label htmlFor='type'>סוג השירות: </label>
                {[{ type: 'global', name: 'גלובלי' }, { type: 'hourly', name: 'לפי שעה' }].map(type => (
                    <div key={type.type}>
                        <input
                            type='radio'
                            name='type'
                            value={type.type}
                            checked={editedservice.type === type.type}
                            onChange={handleChange}
                        />
                        {type.name}
                    </div>
                ))}


                <label htmlFor="price">מחיר:</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={editedservice.price}
                    onChange={handleChange}
                />
                <button className='editButton' type="submit" disabled={isLoading}>
                    {isLoading ? 'מעדכן...' : 'עדכן שירות'}
                </button>
            </form>
        </div>
    );
};

export default EditService;