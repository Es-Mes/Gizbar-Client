import './ServicesList.css'
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth'; // הנחה שאת משתמשת ב-hook הזה
import { useFreezServiceMutation, useUnFreezServiceMutation, useDeleteServiceMutation } from '../servicesApiSlice';
import AddService from "../../services/add/AddService";
import Modal from "../../../modals/Modal";
import { GrEdit, GrFormTrash, GrFormNextLink } from 'react-icons/gr';
import { MdOutlineAcUnit, MdSevereCold, MdHomeRepairService } from 'react-icons/md';
import EditService from '../edit/EditService';
import { useGetAgentQuery } from '../../agent/apiSlice';

const ServicesList = () => {
  const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן
  const { data: agent, isLoading, error } = useGetAgentQuery({ phone })
  const services = agent?.services || [];

  const [deleteService] = useDeleteServiceMutation();
  const [showFreeze, setShowFreeze] = useState(false)
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [isEditModelOpen, setEditModelOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

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
      toast.success("השירות הוקפא!")
    } else {
      unFreezeService(service._id)
      toast.success("הקפאת השירות בוטלה!")
    }
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || ""
  const handleChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ q: value });
    }
    else {
      setSearchParams({}); // מנקה את הפרמטר
    }
  };

  const filteredServices = services
    .filter(service => service.active !== showFreeze)
    .filter(service =>
      q === "" || service.name?.toLowerCase().includes(q.toLowerCase())
    );


  return (
    <div className="service-list-container">
      <div className='header-with-button' style={{ display: "flex", justifyContent: "end", marginBottom: 0 }}>
        {showFreeze && <button style={{ top: "2px" }} className="backButton icon-tooltip" onClick={() => {
          setShowFreeze(!showFreeze);
        }}>
          <GrFormNextLink className='GrFormNextLink' /><span className='tooltip-text'>חזור</span>
        </button>}
        {!showFreeze && <Link onClick={() => {
          setShowFreeze(!showFreeze);
        }}>
          {showFreeze ? ' הצג שירותים פעילים' : ' הצג שירותים מוקפאים'}
          {showFreeze ? <MdSevereCold /> : <MdOutlineAcUnit />}
        </Link>}
      </div>
      <h2> שירותים {showFreeze ? 'מוקפאים' : ''}</h2>
      <div className='services-list-top'>

        <button className="addButton" type="button" onClick={() => { setServiceModalOpen(true); console.log({ isServiceModalOpen }) }}>
          הוספת שירות <MdHomeRepairService />

          {/* <Link to="add">הוספת שירות</Link> */}
        </button>

        <input
          type="text"
          placeholder={'סנן לפי שם שרות'}
          onChange={handleChange}
          value={searchParams.get("q") || ""}
        />
        <div></div>
        <div style={{ alignSelf: "end", justifySelf: "flex-end" }}>
          <div className="hover-grow-icon" style={{ fontSize: "2rem", marginBottom: "0" }}>💼</div>
          <h3 className="customNum" style={{ color: 'var(--bgSoftLight3)' }}>מספר שירותים {showFreeze ? 'מוקפאים' : ''} -  {filteredServices.length}</h3>
        </div>

      </div>

      <table className='services-list-table'>
        <thead className='tHead'>
          <tr>
            <th>שם השירות</th>
            <th>תיאור השירות</th>
            <th>סוג השירות</th>
            {/* <th>סטטוס</th> */}
            <th>מחיר</th>
            <th>עריכה</th>
            <th>{showFreeze ? 'ביטול הקפאה' : 'הקפאה'}</th>
            <th>מחיקה</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map(service => (
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
              {/* <td>
                {service.active ? 'פעיל' : 'מוקפא'}
              </td> */}
              <td>
                {service.price}
              </td>
              <td className='btn-service-list' onClick={() => openEditModel(service)}>
                <GrEdit size={20} />
              </td>
              <td className='btn-service-list' onClick={() => freezeClick(service)}>
                {showFreeze ? <MdSevereCold size={20} /> : <MdOutlineAcUnit size={20} />}
              </td>
              <td className='btn-service-list' onClick={() => handleDeleteService(service._id)}>
                <GrFormTrash size={20} />
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
