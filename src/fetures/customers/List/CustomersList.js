import "./CustomersList.css"
import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import Search from "../../../component/search/Search"
import { useDeleteCustomerMutation } from "../customersApiSlice"
import { Link, useSearchParams, useLocation } from "react-router-dom"
import { LuBellRing } from "react-icons/lu";
import { CiCoinInsert } from "react-icons/ci";
import { FiUserPlus } from "react-icons/fi";
import { PiEyeThin } from "react-icons/pi";
import { GrView, GrEdit, GrFormTrash, GrMoreVertical, GrFormUp } from "react-icons/gr";
import { useDispatch } from "react-redux"
import useAuth from "../../../hooks/useAuth"
import Modal from "../../../modals/Modal"
import EditCustomer from "../edit/EditCustomer"
import AddCustomer from "../add/AddCustomer"
import { useGetAgentQuery } from "../../agent/apiSlice";
import AddTransaction from "../../transactions/add/AddTransaction";
import DeleteCustomer from "../delete/DeleteCustomer";

const CustomersList = () => {
    const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן
    const { data: agent, isLoading, error } = useGetAgentQuery({ phone });
    const customers = agent?.customers || [];

    //תצוגת הטבלה
    const tableRef = useRef(null);
    const [isNarrow, setIsNarrow] = useState(false);
    const location = useLocation();

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [specificCustomer, setSpecificCustomer] = useState(null)
    const [openMenuCustomerId, setOpenMenuCustomerId] = useState(null);
    const [openUpwardsId, setOpenUpwardsId] = useState(null);

    const [isEditModelOpen, setEditModelOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [isAddModelOpen, setAddModelOpen] = useState(false)
    const [isDeleteModelOpen, setDeleteModelOpen] = useState(false)
    const [deleteCustomer, { isSuccess: isDeleteSuccess }] = useDeleteCustomerMutation()

    const actionsRefs = useRef({});

    const toggleActions = (event, customerId) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // אם אין מספיק מקום למטה (פחות מ-150px), נפתח למעלה
        if (spaceBelow < 150 && spaceAbove > 150) {
            setOpenUpwardsId(customerId);
        } else {
            setOpenUpwardsId(null);
        }

        // אם כבר פתוח ללקוח הזה – סגור, אחרת פתח
        setOpenMenuCustomerId(prev => (prev === customerId ? null : customerId));
    };

    const closeMenu = () => {
        setOpenMenuCustomerId(null);
        setOpenUpwardsId(null);
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            const currentRef = openMenuCustomerId
                ? actionsRefs.current[openMenuCustomerId]
                : null;

            if (currentRef && !currentRef.contains(event.target)) {
                setOpenMenuCustomerId(null);
                setOpenUpwardsId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openMenuCustomerId]);

   
    useEffect(() => {
        const table = tableRef.current;
        if (!table) return;

        const checkWidth = () => {
            const width = table.offsetWidth;
            setIsNarrow(width < 640);
            console.log("width checked:", width);
        };

        const observer = new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;
            setIsNarrow(width < 640);
            console.log("ResizeObserver:", width);
        });

        observer.observe(table);

        // דחיית הקריאה הראשונית עד שה־DOM יתייצב
        const timeout = setTimeout(checkWidth, 100);

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [location.pathname]);


    const openEditModel = (customer) => {
        setSelectedCustomer(customer);
        setEditModelOpen(true);
    }

    const openDeleteModel = (customer) => {
        console.log("openDeleteModel");
        setSpecificCustomer(customer)
        setDeleteModelOpen(true);
    }

    const addCustomerClick = () => {
        setAddModelOpen(true);
    }
    const openTransactionModal = () => {
        setIsTransactionModalOpen(true);
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
    const filteredData = q === ""
        ? [...customers]
        : customers.filter(c =>
            c.full_name?.toLowerCase().includes(q.toLowerCase())
        );

    if (isLoading) return <p>טוען נתונים...</p>;
    if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

    return (
        <div className="customers-list">
            <h1 style={{ color: 'var(--text)' }} className="customers-title">לקוחות</h1>
            <div className="customers-list-top">
                <button onClick={addCustomerClick}>
                    הוספת לקוח <FiUserPlus />
                </button>
                <input
                    type="text"
                    placeholder={'חפש לפי שם לקוח'}
                    onChange={handleChange}
                    value={searchParams.get("q") || ""}
                />
                <div style={{alignSelf:"end"
                }}>
                    <div className="hover-grow-icon"><img src="/icons8-users-50.png"/></div>
                    <h3 className="customNum" style={{ color: 'var(--bgSoftLight3)' }}>מספר הלקוחות שלך -  {customers.length}</h3>
                </div>
            </div>
            <table ref={tableRef} className="customers-list-table">
                <thead className="tHeads">
                    <tr>
                        <th className="td-no-border first">שם לקוח</th>
                        <th className="td-no-border">טלפון</th>
                        {!isNarrow && <>
                            <th className="td-no-border">אימייל</th>
                            <th className="td-no-border">עיר</th>
                        </>}
                        <th className="td-no-border">מספר גביות</th>
                        <th className="td-no-border">הוסף גביה</th>
                        <th className="td-no-border">צפייה בלקוח</th>
                        <th className="td-no-border last">פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(customer => (
                        <tr key={customer._id}>
                            <td>
                                <div className="customers-list-customer">
                                    {customer.full_name}
                                </div>
                            </td>
                            <td>
                                {customer.phone}
                            </td>
                            {!isNarrow && <td className="email">
                                {customer.email}
                            </td>}
                            {!isNarrow && <td className="city">
                                {customer.city}
                            </td>}


                            <td className="edit_btn">
                            </td>
                            <td onClick={() => { openTransactionModal(); setSpecificCustomer(customer._id) }} className="btn-customer-list">
                                <CiCoinInsert size={20} />

                            </td>
                            <td className="btn-customer-list">
                                <Link to={`/dash/customers/${customer._id}`} className="customers-list-btn customers-list-view">
                                    <PiEyeThin size={20} />
                                </Link>
                            </td>
                            <td style={{ position: "relative" }} 
                            >
                                <div ref={(el) => (actionsRefs.current[customer._id] = el)}>
                                    
                                    <span
                                        onClick={(event) => { toggleActions(event, customer._id) }} style={{ cursor: "pointer" }}>
                                        {openMenuCustomerId === customer._id ? <GrFormUp size={20} /> : <GrMoreVertical size={20} />}
                                    </span>
                                    {openMenuCustomerId === customer._id && (
                                        <div className={`actions-dropdown floating-menu ${openUpwardsId === customer._id ? "open-up" : ""}`}>
                                            <div
                                                className="action-item"
                                                onClick={() => {
                                                    openEditModel(customer);
                                                    closeMenu();
                                                }}
                                            >
                                                <GrEdit size={20} /> עריכה
                                            </div>
                                            <div
                                                className="action-item"
                                                onClick={closeMenu} // אם אין פעולה, רק סוגר
                                            >
                                                <LuBellRing size={20} /> שלח הודעה
                                            </div>
                                            <div
                                                onClick={() => {
                                                    console.log("clicked");
                                                    openDeleteModel(customer);
                                                    closeMenu();
                                                }}
                                                className="action-item"
                                            >
                                                <GrFormTrash size={20} /> מחיקה
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                            {/* <td className="td-no-border">
                                <div className="customers-list-btns">
                                <Link to={`/dash/customers/${customer._id}`} className="customers-list-btn customers-list-view">תצוגה</Link>
                                <button onClick={()=>{deleteClick(customer)}} className="customers-list-btn customers-list-delete">מחיקה</button></div>
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isEditModelOpen} onClose={() => setEditModelOpen(false)}>
                <EditCustomer
                    customer={selectedCustomer}
                    onSuccess={() => {setEditModelOpen(false);toast.success("העריכה נשמרה 👍 ",{icon:false})}} />
            </Modal>
            <Modal isOpen={isAddModelOpen} onClose={() => setAddModelOpen(false)}>
                <AddCustomer
                    onSuccess={() => setAddModelOpen(false)} />
            </Modal>
            <Modal isOpen={isDeleteModelOpen} onClose={() => setDeleteModelOpen(false)}>
                <DeleteCustomer
                    customer={specificCustomer}
                    onSuccess={() => setDeleteModelOpen(false)} />
            </Modal>

            <Modal isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                disableOverlayClick={true}
            >
                <AddTransaction specificCustomer={specificCustomer}
                    onSuccess={() => {
                        setTimeout(() => setIsTransactionModalOpen(false), 2000);
                    }}
                />
            </Modal>

        </div>
    )
}
export default CustomersList