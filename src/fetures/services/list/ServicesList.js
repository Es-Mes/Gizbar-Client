import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth'; // הנחה שאת משתמשת ב-hook הזה
import './ServicesList.css'; // קובץ CSS
import { useUpdateServiceMutation, useFreezServiceMutation, useUnFreezServiceMutation, useDeleteServiceMutation } from '../servicesApiSlice';
import { updateServiceStore, toggleServiceFreezeStore,deleteServiceStore } from '../../../app/agentSlice';
import { Link } from '@mui/material';

const ServicesList = () => {
  const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן
  const services = useSelector((state) => state.agent?.data?.data?.services || []);
  const filterServices = services.filter((service) => {
    return service.active === true 
   })
  const [updateService, { isLoading, isSuccess, isError, error }] = useUpdateServiceMutation()
  const [deleteService] = useDeleteServiceMutation();

  const [editServiceId, setEditServiceId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '' });
  const [expanded, setExpanded] = useState(null); // שמירת מצב פתיחה של כל שירות
  const dispatch = useDispatch();

  // הקפאת שירות
  const [freezService] = useFreezServiceMutation();
  const [unFreezService] = useUnFreezServiceMutation();
  const freezeService = async (id) => {
    try {
      console.log('Sending to API:', { phone, _id: id });
      const data = await freezService({ phone, _id: id }).unwrap();
      console.dir(data, { depth: null, colors: true });
      if (data) {
        dispatch(toggleServiceFreezeStore(id)); // עדכון הסטור
        // setEditServiceId(null); // סגירת הטופס
      }
    } catch (error) {
      console.error('Error freezing service:', error?.data || error.message || error);
      alert('Failed to freeze service.');
    }
  };
  const unFreezeService = async (id) => {
    try {
      console.log('Sending to API:', { phone, _id: id });
      const data = await unFreezService({ phone, _id: id }).unwrap();
      console.dir(data, { depth: null, colors: true });
      if (data) {
        dispatch(toggleServiceFreezeStore(id)); // עדכון הסטור
        // setEditServiceId(null); // סגירת הטופס
      }
    } catch (error) {
      console.error('Error freezing service:', error?.data || error.message || error);
      alert('Failed to freeze service.');
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את השירות הזה?')) {
      try {
        const data = await deleteService({ phone, _id: id }).unwrap();
        console.log('Service deleted:', data);
        dispatch(deleteServiceStore(id)); // עדכון הסטור
        alert('השירות נמחק בהצלחה.');
      } catch (error) {
        console.error('Error deleting service:', error?.data || error.message || error);
        alert('מחיקת השירות נכשלה.');
      }
    }
  };



  // פתיחת תיבת עריכה
  const openEditDialog = (service) => {
    // console.dir(service, { depth: null, colors: true });
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
      if (data) {
        dispatch(updateServiceStore(data.data.services)); // עדכון הסטור
        setEditServiceId(null); // סגירת הטופס
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service.');
    }
  };

  // שינוי מצב פתיחה/סגירה
  const toggleExpand = (id) => {
    setExpanded((prev) => (prev == id ? null : id));
  };

  return (
    <div className="service-list-container">
      <h2>רשימת שירותים</h2>
      <button>
               <Link to="services/add">הוספת שירות</Link>
      </button>
      <p className="service-icons-info">
        ⏳ שירות לפי שעה | 📦 שירות גלובלי
    </p>
      {services.length === 0 ? (
        <p>אין שירותים זמינים.</p>
      ) : (
        <ul className="service-list">
    {filterServices.map((service) => (
        <li className="service-card" key={service._id}>
            {editServiceId === service._id ? (
                <div className="service-edit-dialog">
                    <h3>עריכת שירות</h3>
                    <label>
                        שם השירות:
                        <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                        />
                    </label>
                    <label>
                        תיאור:
                        <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                        ></textarea>
                    </label>
                    <label>
                        מחיר:
                        <input
                            type="number"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditChange}
                        />
                    </label>
                    <div className="service-actions">
                        <button onClick={submitEditForm}>שמירה</button>
                        <button onClick={() => setEditServiceId(null)}>ביטול</button>
                    </div>
                </div>
            ) : (
                <div className="service-body">
                    <div className="service-header">
                        <h3>
                            {service.type === 'hourly' ? '⏳' : '📦'} {service.name}
                        </h3>
                        <p className="service-price">₪ {service.price} {service.type === 'hourly' ? 'לשעה' : ''}</p>
                    </div>
                    <div className="service-details">
                        <p><strong>תיאור:</strong> {service.description}</p>
                        <p><strong>סטטוס:</strong> {service.active ? 'פעיל' : 'לא פעיל'}</p>
                    </div>
                    <div className="service-actions-column">
                        <button className="action-button edit-button" onClick={() => openEditDialog(service)}>
                            ✏️ עריכה
                        </button>
                        <button className="action-button freeze-button" onClick={service.active ? (() => freezeService(service._id)) : (() => unFreezeService(service._id))}>
                            {service.active ? '❄️ הקפאה' : '✅ ביטול הקפאה'}
                        </button>
                        <button className="action-button delete-button" onClick={() => handleDeleteService(service._id)}>
                            🗑️ מחיקה
                        </button>
                    </div>
                </div>
            )}
        </li>
    ))}
</ul>


        // <ul className="service-list">
        //   {filterServices.map((service) => (
        //     <li className="container" key={service._id}>
        //       {editServiceId === service._id ? (
        //         <div className="edit-dialog container">
        //           <h3>עריכת שירות</h3>
        //           <label>
        //             שם השירות:
        //             <input
        //               type="text"
        //               name="name"
        //               value={editForm.name}
        //               onChange={handleEditChange}
        //             />
        //           </label>
        //           <label>
        //             תיאור:
        //             <textarea
        //               name="description"
        //               value={editForm.description}
        //               onChange={handleEditChange}
        //             ></textarea>
        //           </label>
        //           <label>
        //             מחיר:
        //             <input
        //               type="number"
        //               name="price"
        //               value={editForm.price}
        //               onChange={handleEditChange}
        //             />
        //           </label>
        //           <button onClick={submitEditForm}>שמירה</button>
        //           <button onClick={() => setEditServiceId(null)}>ביטול</button>
        //         </div>
        //       ) : (
        //         <div>
        //           <div className="basicRow">
        //             <div className="service-header">
        //               <button
        //                 className="toggleButton"
        //                 onClick={() => toggleExpand(service._id)}
        //               >
        //                 {expanded === service._id ? '▼' : '▶'}
        //               </button>
        //               <h3>{service.name}</h3>
        //             </div>
        //             <div>

        //               <button
        //                 className="toggleButton actions"
        //                 onClick={() => openEditDialog(service)}
        //               >
        //                 עריכה
        //               </button>
        //               <button
        //                 className="toggleButton actions"
        //                 onClick={service.active ? (() => freezeService(service._id)) : (() => unFreezeService(service._id))}
        //               >
        //                 {service.active ? 'הקפאה' : 'ביטול הקפאה'}
        //               </button>
        //               <button
        //                 className="toggleButton actions"
        //                 onClick={() => handleDeleteService(service._id)}
        //               >
        //                 מחיקה
        //               </button>

        //             </div>
        //           </div>
        //           {expanded === service._id && (
        //             <div className="details">
        //               <p>{service.description}</p>
        //               <p>מחיר: ₪ {service.price}</p>
        //               <p>סטטוס: {service.active ? 'פעיל' : 'לא פעיל'}</p>
        //             </div>
        //           )}
        //         </div>
        //       )}
        //     </li>
        //   ))}

        // </ul>
      )}
    </div>
  );
};

export default ServicesList;
