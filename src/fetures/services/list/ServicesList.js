import './newStyle.css'
import React, { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth'; // הנחה שאת משתמשת ב-hook הזה
import { useFreezServiceMutation, useUnFreezServiceMutation, useDeleteServiceMutation } from '../servicesApiSlice';
import AddService from "../../services/add/AddService";
import Modal from "../../../modals/Modal";
import { GrEdit, GrFormTrash } from 'react-icons/gr';
import { MdOutlineAcUnit, MdSevereCold } from 'react-icons/md';
import EditService from '../edit/EditService';
import { useGetAgentQuery } from '../../../app/apiSlice';

const ServicesList = () => {
  const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן
  const {data: agent,isLoading,error} = useGetAgentQuery({phone})
  const services = agent?.services ||[];

  const [deleteService] = useDeleteServiceMutation();
  const [showFreeze, setShowFreeze] = useState(false)
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [isEditModelOpen, setEditModelOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [filterServices, setFilterServices] = useState(services.filter((service) => service.active === true))
  useEffect(() => {
    setFilterServices(services.filter((service) => service.active !== showFreeze));
  }, [showFreeze, services]);

  // הקפאת שירות
  const [freezService] = useFreezServiceMutation();
  const [unFreezService] = useUnFreezServiceMutation();

  const freezeService = async (id) => {
    try {
      console.log('Sending to API:', { phone, _id: id });
      const data = await freezService({ phone, _id: id }).unwrap();
      console.dir(data, { depth: null, colors: true });
      
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
        alert('השירות נמחק בהצלחה.');
      } catch (error) {
        console.error('Error deleting service:', error?.data || error.message || error);
        alert('מחיקת השירות נכשלה.');
      }
    }
  };

  const openEditModel = service => {
    setSelectedService(service);
    setEditModelOpen(true);
  }

  const freezeClick = service => {
    if (service.active) {
      freezeService(service._id);
    } else {
      unFreezeService(service._id)
    }
  }

  return (
    <div className="service-list-container">
      <h2>רשימת שירותים {showFreeze ? 'מוקפאים' : 'פעילים'}</h2>
      <div className='btn-container'>

        <button className="addButton" type="button" onClick={() => { setServiceModalOpen(true); console.log({ isServiceModalOpen }) }}>
          הוספת שירות
          {/* <Link to="add">הוספת שירות</Link> */}
        </button>
        <button className='showActive' type='button' onClick={() => {
          setShowFreeze(!showFreeze);
        }}>
          {showFreeze ? 'הצג שירותים פעילים' : 'הצג שירותים מוקפאים'}
        </button>
      </div>

      <table className='services-list-table'>
        <thead className='tHead'>
          <tr>
            <th>שם הלקוח</th>
            <th>תיאור השירות</th>
            <th>סוג השירות</th>
            <th>סטטוס</th>
            <th>מחיר</th>
            <th>עריכה</th>
            <th>{showFreeze ? 'ביטול הקפאה' : 'הקפאה'}</th>
            <th>מחיקה</th>
          </tr>
        </thead>
        <tbody>
          {filterServices.map(service => (
            <tr key={service._id}>
              <td>
                {service.name}
              </td>
              <td>
                {service.description}
              </td>
              <td>
                {service.type === 'hourly' ? 'שירות שעתי' : 'שירות גלובלי'}
              </td>
              <td>
                {service.active ? 'פעיל' : 'מוקפא'}
              </td>
              <td>
                {service.price}
              </td>
              <td className='btn-service-list' onClick={() => openEditModel(service)}>
                <GrEdit size={20} color="teal" />
              </td>
              <td className='btn-service-list' onClick={() => freezeClick(service)}>
                {showFreeze ? <MdSevereCold size={20} color='green' /> : <MdOutlineAcUnit size={20} color='green' />}
              </td>
              <td className='btn-service-list' onClick={() => handleDeleteService(service._id)}>
                <GrFormTrash size={20} color='red' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isServiceModalOpen} onClose={() => setServiceModalOpen(false)}>
        <AddService
          onSuccess={() => {
            // Handle successful service addition if necessary
            setServiceModalOpen(false);
          }}
        />
      </Modal>
      <Modal isOpen={isEditModelOpen} onClose={() => setEditModelOpen(false)}>
        <EditService
          service={selectedService}
          onSuccess={() => {
            setEditModelOpen(false);
          }}
        />
      </Modal>


    </div>
  );
};

export default ServicesList;
