import React, { useState } from 'react'
import { toast } from 'react-toastify';

import '../../../component/LoadingScreen.css';
import useAuth from '../../../hooks/useAuth';
import { useDeleteServiceMutation } from '../servicesApiSlice';


const DeleteService = ({ service, onSuccess }) => {
    const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן
    const [deleteService,{isSuccess: isDeleteSuccess}] = useDeleteServiceMutation()
    // const [deleteCustomer, { isSuccess: isDeleteSuccess }] = useDeleteCustomerMutation()
    const [clicked, setClicked] = useState(false);
    const [message, setMessage] = useState(null)
    const deleteClick = async (service) => {
        console.log(service);
        try {
            const result = await deleteService({ phone, _id: service._id });
           
                setClicked(true)
                toast.success("השירות נמחק בהצלחה 👍 ",{icon:false})
                setTimeout(() => {
                    onSuccess()
                }, 2000)
            
        }
        catch (err) {
            setMessage(`שגיאה במחיקת השירות ${err.error}`)
        }
    }

    return (
        <div className="background-screen">
            <div className="loading-box">
                <div className=" fade-icon icon-rotate"><img src='/icons8-briefcase-50.png'/></div>
                <p className="loading-subtitle">האם אתה בטוח שברצונך למחוק את השירות ?</p>
                <h1 className="loading-title">{service.name}</h1>
                <p>{service.description}</p>
                <p>{service.type}</p>
                <p>{service.price}</p>
                <p>{service.active ? "שרות פעיל" :"שרות לא פעיל"}</p>
                {message && <p style={{ color: "#f9a825" }}>{message}</p>}
                <div className='navigation-buttons'>
                    <button className='modelBtn' onClick={onSuccess}>ביטול</button>
                    <button className='modelBtn' onClick={() => { deleteClick(service) }} disabled={clicked}>אישור</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteService
