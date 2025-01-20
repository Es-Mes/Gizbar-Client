import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth'; // הנחה שאת משתמשת ב-hook הזה
import './ServicesList.css'; // קובץ CSS
import { useUpdateServiceMutation, useFreezServiceMutation } from '../servicesApiSlice';
import { updateServiceStore } from '../../../app/agentSlice';
const ServicesList = () => {
  const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן
  const services = useSelector((state) => state.agent?.data?.data?.services || []);
  const [updateService, { isLoading, isSuccess, isError, error }] = useUpdateServiceMutation()
  const [editServiceId, setEditServiceId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '' });
  const [expanded, setExpanded] = useState({}); // שמירת מצב פתיחה של כל שירות
  const dispatch = useDispatch();

  // הקפאת שירות
  const [freezService] = useFreezServiceMutation();

  const freezeService = async (id) => {
    try {
      await freezService({ phone, _id: id }).unwrap();
      alert('Service has been frozen successfully!');
    } catch (error) {
      console.error('Error freezing service:', error);
      alert('Failed to freeze service.');
    }
  };


  // פתיחת תיבת עריכה
  const openEditDialog = (service) => {
    console.dir(service, { depth: null, colors: true });
    setEditServiceId(service._id);
    setEditForm({ name: service.name, description: service.description, price: service.price });
  };

  // שינוי ערכים בטופס
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // שליחת טופס עריכה
  const submitEditForm = async () => {
    try {
      const updatedService = ({ _id: editServiceId, name: editForm.name, description: editForm.description, price: editForm.price })
      const data = await updateService({ phone, service: updatedService }).unwrap();
      console.dir(data, { depth: null, colors: true });
      // if(data){
      // dispatch(updateServiceStore(data)); // עדכון הסטור
      // setEditServiceId(null); // סגירת הטופס
      // }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service.');
    }
  };

  // שינוי מצב פתיחה/סגירה
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <h2>Services List</h2>
      {services.length === 0 ? (
        <p>No services available.</p>
      ) : (
        <ul className="service-list">
          {services.map((service) => (
            <li className="container" key={service._id}>
              {editServiceId === service._id ? (
                <div className="edit-dialog container">
                  <h3>Edit Service</h3>
                  <label>
                    Name:
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>
                    Description:
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                    ></textarea>
                  </label>
                  <label>
                    Price:
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                    />
                  </label>
                  <button onClick={submitEditForm}>Save</button>
                  <button onClick={() => setEditServiceId(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <div className="basicRow">
                    <div className="service-header">
                      <button
                        className="toggleButton"
                        onClick={() => toggleExpand(service._id)}
                      >
                        {expanded[service._id] ? '▼' : '▶'}
                      </button>
                      <h3>{service.name}</h3>
                    </div>
                    <div>
                      <button
                        className="toggleButton"
                        onClick={() => freezeService(service._id)}
                      >
                        {service.active ? 'Freeze' : 'Unfreeze'}
                      </button>
                      <button
                        className="toggleButton"
                        onClick={() => openEditDialog(service)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  {expanded[service._id] && (
                    <div className="details">
                      <p>{service.description}</p>
                      <p>Price: ${service.price}</p>
                      <p>Status: {service.active ? 'Active' : 'Inactive'}</p>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}

        </ul>
      )}
    </div>
  );
};

export default ServicesList;
