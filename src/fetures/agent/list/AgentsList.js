import "../../customers/List/CustomersList.css"
import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import Search from "../../../component/search/Search"
import { Link, useSearchParams, useLocation } from "react-router-dom"
import { LuBellRing } from "react-icons/lu";
import { CiCoinInsert } from "react-icons/ci";
import { FiUserPlus } from "react-icons/fi";
import { PiEyeThin } from "react-icons/pi";
import { GrView, GrEdit, GrFormTrash, GrMoreVertical, GrFormUp } from "react-icons/gr";
import { useDispatch } from "react-redux"
import useAuth from "../../../hooks/useAuth"
import Modal from "../../../modals/Modal"
import { useGetAgentQuery } from "../apiSlice";
import AddTransaction from "../../transactions/add/AddTransaction";

const AgentsList = () => {
    const {phone} = useAuth()
    const {data: agents,isLoading,error} = useGetAgentQuery({phone})
    console.log(agents);
    const agentsList = Array.isArray(agents) ? agents : agents ? [agents] : [];
    console.log(agentsList);
    
    // const customers = agent?.customers || [];

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
    const [checkedWidth, setCheckedWidth] = useState(false);

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
    }, []);
   useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const checkWidth = () => {
            const width = table.offsetWidth;
            setIsNarrow(width < 740);
        };

    const observer = new ResizeObserver(([entry]) => {
        const width = entry.contentRect.width;
        setIsNarrow(width < 740);
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
        ? agentsList
        : agentsList?.filter(c =>
            c.full_name?.toLowerCase().includes(q.toLowerCase())
        );

    if (isLoading) return <p>טוען נתונים...</p>;
    if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

    return (
        <div className="agents-list">
            <h1 style={{ color: 'var(--text)' }} className="agents-title">משתמשים</h1>
            <div className="agents-list-top">
                <button onClick={addCustomerClick}>
                    הוספת משתמש למערכת <FiUserPlus />
                </button>
                <input
                    type="text"
                    placeholder={'סנן לפי שם פרטי'}
                    onChange={handleChange}
                    value={searchParams.get("q") || ""}
                />
                <div style={{alignSelf:"end"
                }}>
                    <div className="hover-grow-icon"><img src="/icons8-contacts-50.png"/></div>
                    <h3 className="customNum" style={{ color: 'var(--bgSoftLight3)' }}>מספר המשתמשים במערכת  {agents?.length}</h3>
                </div>
            </div>
            <table ref={tableRef} className="agents-list-table">
                <thead className="tHeads">
                    <tr>
                        <th className="td-no-border">שם פרטי</th>
                        <th className="td-no-border">משפחה</th>
                        <th className="td-no-border">תאריך כניסה</th>
                        <th className="td-no-border">טלפון</th>
                        {!isNarrow && <>
                            <th className="td-no-border">אימייל</th>
                            <th className="td-no-border">עיר</th>
                        </>}
                        <th className="td-no-border">סליקת אשראי</th>
                        <th className="td-no-border">מספר לקוחות</th>
                        <th className="td-no-border">פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(agent => (
                        <tr key={agent._id}>
                            <td>
                                {agent.full_name}
                            </td>
                            <td>
                                {agent.last_name}
                            </td>
                            <td>
                                {agent.createdAt?.slice(0,10)}
                            </td>
                            <td>
                                {agent.phone}
                            </td>
                            {!isNarrow && <td className="email">
                                {agent.email}
                            </td>}
                            {!isNarrow && <td className="city">
                                {agent.city}
                            </td>}


                            <td>
                                {agent.paymentType}
                            </td>
                            <td>
                                {agent?.customers?.length}
                            </td>
                            <td style={{ position: "relative" }} ref={(el) => (actionsRefs.current[agent._id] = el)}
                            >
                                <span
                                    onClick={(event) => { toggleActions(event, agent._id) }} style={{ cursor: "pointer" }}>
                                    {openMenuCustomerId === agent._id ? <GrFormUp size={20} /> : <GrMoreVertical size={20} />}
                                </span>
                                {openMenuCustomerId === agent._id && (
                                    <div className={`actions-dropdown floating-menu ${openUpwardsId === agent._id ? "open-up" : ""}`}>

                                        <div
                                            className="action-item"
                                            onClick={() => {
                                                // openEditModel(agent);
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
                                                // openDeleteModel(agent);
                                                closeMenu();
                                            }}
                                            className="action-item"
                                        >
                                            <GrFormTrash size={20} /> מחיקה
                                        </div>



                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* <Modal isOpen={isEditModelOpen} onClose={() => setEditModelOpen(false)}>
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
            </Modal> */}

        </div>
    )
}
export default AgentsList