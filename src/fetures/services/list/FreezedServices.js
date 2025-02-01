import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAuth from '../../../hooks/useAuth';
import { useUpdateServiceMutation, useFreezServiceMutation, useUnFreezServiceMutation, useDeleteServiceMutation } from '../servicesApiSlice';
import { updateServiceStore, toggleServiceFreezeStore, deleteServiceStore } from '../../../app/agentSlice';
import './ServicesList.css';

const FreezedServices = () => {
    const { phone } = useAuth();
    const services = useSelector((state) => state.agent?.data?.data?.services || []);
    const filterServices = services.filter(service => !service.active);
    const [updateService] = useUpdateServiceMutation();
    const [deleteService] = useDeleteServiceMutation();
    const [freezService] = useFreezServiceMutation();
    const [unFreezService] = useUnFreezServiceMutation();
    const [editServiceId, setEditServiceId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', price: '' });
    const dispatch = useDispatch();

    const handleDeleteService = async (id) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את השירות הזה?')) {
            try {
                await deleteService({ phone, _id: id }).unwrap();
                dispatch(deleteServiceStore(id));
                alert('השירות נמחק בהצלחה.');
            } catch (error) {
                alert('מחיקת השירות נכשלה.');
            }
        }
    };

    const toggleFreezeService = async (service) => {
        try {
            const action = service.active ? freezService : unFreezService;
            await action({ phone, _id: service._id }).unwrap();
            dispatch(toggleServiceFreezeStore(service._id));
        } catch (error) {
            alert('פעולה נכשלה.');
        }
    };

    const openEditDialog = (service) => {
        setEditServiceId(service._id);
        setEditForm({ name: service.name, description: service.description, price: service.price });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const submitEditForm = async () => {
        try {
            const updatedService = { _id: editServiceId, ...editForm };
            const data = await updateService({ phone, service: updatedService }).unwrap();
            dispatch(updateServiceStore(data.data.services));
            setEditServiceId(null);
        } catch (error) {
            alert('עדכון השירות נכשל.');
        }
    };

    return (
        <div className="service-list-container">
            <h2>שירותים מוקפאים</h2>
            <p className="service-icons-info">⏳ שירות לפי שעה | 📦 שירות גלובלי</p>
            {filterServices.length === 0 ? (
                <p>אין שירותים מוקפאים.</p>
            ) : (
                <ul className="service-list">
                    {filterServices.map((service) => (
                        <li className="service-card" key={service._id}>
                            {editServiceId === service._id ? (
                                <div className="service-edit-dialog">
                                    <h3>עריכת שירות</h3>
                                    <label>
                                        שם השירות:
                                        <input type="text" name="name" value={editForm.name} onChange={handleEditChange} />
                                    </label>
                                    <label>
                                        תיאור:
                                        <textarea name="description" value={editForm.description} onChange={handleEditChange}></textarea>
                                    </label>
                                    <label>
                                        מחיר:
                                        <input type="number" name="price" value={editForm.price} onChange={handleEditChange} />
                                    </label>
                                    <div className="service-actions">
                                        <button onClick={submitEditForm}>שמירה</button>
                                        <button onClick={() => setEditServiceId(null)}>ביטול</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="service-body">
                                    <div className="service-header">
                                        <h3>{service.type === 'hourly' ? '⏳' : '📦'} {service.name}</h3>
                                        <p className="service-price">₪ {service.price} {service.type === 'hourly' ? 'לשעה' : ''}</p>
                                    </div>
                                    <div className="service-details">
                                        <p><strong>תיאור:</strong> {service.description}</p>
                                        <p><strong>סטטוס:</strong> {service.active ? 'פעיל' : 'לא פעיל'}</p>
                                    </div>
                                    <div className="service-actions-column">
                                        <button className="action-button edit-button" onClick={() => openEditDialog(service)}>✏️ עריכה</button>
                                        <button className="action-button freeze-button" onClick={() => toggleFreezeService(service)}>
                                            {service.active ? '❄️ הקפאה' : '✅ ביטול הקפאה'}
                                        </button>
                                        <button className="action-button delete-button" onClick={() => handleDeleteService(service._id)}>🗑️ מחיקה</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FreezedServices;
