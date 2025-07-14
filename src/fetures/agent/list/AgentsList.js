import "../../customers/List/CustomersList.css"
import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast } from 'react-toastify';
import Search from "../../../component/search/Search"
import { Link, useSearchParams, useLocation } from "react-router-dom"
import { LuBellRing } from "react-icons/lu";
import { CiCoinInsert } from "react-icons/ci";
import { FiUserPlus } from "react-icons/fi";
import { PiEyeThin } from "react-icons/pi";
import { GrView, GrEdit, GrFormTrash, GrMoreVertical, GrFormUp } from "react-icons/gr";
import { MdOutlineRefresh } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { useDispatch } from "react-redux"
import useAuth from "../../../hooks/useAuth"
import Modal from "../../../modals/Modal"
import { useGetAllAgentsQuery } from "../AgentApiSlice";
import AddTransaction from "../../transactions/add/AddTransaction";
import { TextField, Button, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SendMessageToAgent from "../messages/SendMessageToAgent";
import BulkMessageToAgents from "../messages/BulkMessageToAgents";
import AgentDetailsView from "../view/AgentDetailsView";

const AgentsList = () => {
    const { phone } = useAuth()
    const { data: agents, isLoading, error } = useGetAllAgentsQuery({ phone })
    console.log(agents);
    const agentsList = Array.isArray(agents) ? agents : agents ? [agents] : [];
    console.log(agentsList);

    // מערכת הסינון המתקדמת
    const [showFilters, setShowFilters] = useState(false);
    const [nameFilter, setNameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [customersCountFilter, setCustomersCountFilter] = useState('');

    // בדיקה אם יש סינון פעיל
    const isFilterActive = Boolean(
        nameFilter.trim() ||
        emailFilter.trim() ||
        cityFilter.trim() ||
        paymentTypeFilter ||
        fromDate ||
        toDate ||
        customersCountFilter
    );

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

    // הוספת state עבור הודעות קבוצתיות
    const [isBulkMessageModalOpen, setBulkMessageModalOpen] = useState(false);
    const [selectedAgentForMessage, setSelectedAgentForMessage] = useState(null);
    const [isMessageModalOpen, setMessageModalOpen] = useState(false);

    // הוספת state עבור צפייה במשתמש
    const [isViewAgentModalOpen, setViewAgentModalOpen] = useState(false);
    const [selectedAgentForView, setSelectedAgentForView] = useState(null);

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

    // פונקציות עבור הודעות
    const openBulkMessageModal = () => {
        setBulkMessageModalOpen(true);
    }

    const openMessageModal = (agent) => {
        setSelectedAgentForMessage(agent);
        setMessageModalOpen(true);
        closeMenu();
    };

    // פונקציה לפתיחת מודאל צפייה במשתמש
    const openViewAgentModal = (agent) => {
        setSelectedAgentForView(agent);
        setViewAgentModalOpen(true);
    };


    const [searchParams, setSearchParams] = useSearchParams();

    const q = searchParams.get("q") || ""
    const handleChange = (e) => {
        const value = e.target.value;
        setNameFilter(value); // עדכון הסינון החדש
        if (value) {
            setSearchParams({ q: value });
        }
        else {
            setSearchParams({}); // מנקה את הפרמטר
        }
    };

    // סינון מתקדם עם useMemo לביצועים טובים יותר
    const filteredData = useMemo(() => {
        if (!agentsList) return [];

        return agentsList.filter(agent => {
            let isMatch = true;

            // סינון לפי שם (שם פרטי או משפחה)
            if (nameFilter.trim() !== '') {
                const fullName = `${agent.first_name || ''} ${agent.last_name || ''}`.toLowerCase();
                isMatch = isMatch && fullName.includes(nameFilter.toLowerCase());
            }

            // סינון לפי אימייל
            if (emailFilter.trim() !== '') {
                const email = agent.email || '';
                isMatch = isMatch && email.toLowerCase().includes(emailFilter.toLowerCase());
            }

            // סינון לפי עיר
            if (cityFilter.trim() !== '') {
                const city = agent.city || '';
                isMatch = isMatch && city.toLowerCase().includes(cityFilter.toLowerCase());
            }

            // סינון לפי סוג סליקת אשראי
            if (paymentTypeFilter !== '') {
                isMatch = isMatch && agent.paymentType === paymentTypeFilter;
            }

            // סינון לפי תאריך הצטרפות
            if (fromDate) {
                const agentDate = new Date(agent.createdAt);
                const filterFromDate = new Date(fromDate);
                isMatch = isMatch && agentDate >= filterFromDate;
            }

            if (toDate) {
                const agentDate = new Date(agent.createdAt);
                const filterToDate = new Date(toDate);
                isMatch = isMatch && agentDate <= filterToDate;
            }

            // סינון לפי מספר לקוחות
            if (customersCountFilter !== '') {
                const customersCount = agent.customers?.length || 0;
                switch (customersCountFilter) {
                    case '0':
                        isMatch = isMatch && customersCount === 0;
                        break;
                    case '1-10':
                        isMatch = isMatch && customersCount >= 1 && customersCount <= 10;
                        break;
                    case '11-50':
                        isMatch = isMatch && customersCount >= 11 && customersCount <= 50;
                        break;
                    case '50+':
                        isMatch = isMatch && customersCount > 50;
                        break;
                    default:
                        break;
                }
            }

            return isMatch;
        });
    }, [agentsList, nameFilter, emailFilter, cityFilter, paymentTypeFilter, fromDate, toDate, customersCountFilter]);

    // פונקציה לאיפוס כל הסינונים
    const clearAllFilters = () => {
        setNameFilter('');
        setEmailFilter('');
        setCityFilter('');
        setPaymentTypeFilter('');
        setFromDate('');
        setToDate('');
        setCustomersCountFilter('');
        setSearchParams({});
    };

    if (isLoading) return <p>טוען נתונים...</p>;
    if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

    return (
        <div className="agents-list">
            <h1 style={{ color: 'var(--text)' }} className="agents-title">משתמשים</h1>
            <div className="agents-list-top">
                <button onClick={addCustomerClick}>
                    הוספת משתמש למערכת <FiUserPlus />
                </button>
                <button
                    onClick={openBulkMessageModal}
                    style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                    }}
                >
                    <LuBellRing size={16} />
                    שלח הודעה לכל המשתמשים ({filteredData?.length})
                </button>
                <input
                    type="text"
                    placeholder={'סנן לפי שם פרטי או משפחה'}
                    onChange={handleChange}
                    value={nameFilter}
                />
                <div style={{
                    alignSelf: "end"
                }}>
                    <div className="hover-grow-icon"><img src="/icons8-contacts-50.png" /></div>
                    <h3 className="customNum" style={{ color: 'var(--bgSoftLight3)' }}>
                        מספר המשתמשים במערכת: {filteredData?.length} מתוך {agentsList?.length}
                    </h3>
                </div>
            </div>

            {/* כפתורי סינון מתקדם */}
            <div style={{ marginBottom: "1rem", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button
                    sx={{
                        color: "#755dedba",
                        borderColor: "#755dedba",
                        fontSize: "1rem",
                        gap: "5px",
                        backgroundColor: "#7f6ddc34",
                        transition: "all 0.2s ease",
                        '&:active': {
                            backgroundColor: "#765cf831",
                            transform: "scale(0.98)",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }
                    }}
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outlined"
                >
                    {showFilters ? "הסתר סינון מתקדם" : "סינון מתקדם"}
                    <IoSearch />
                </Button>

                {isFilterActive && (
                    <Button
                        sx={{
                            color: "#755dedba",
                            borderColor: "#755dedba",
                            fontSize: "1rem",
                            gap: "5px",
                            backgroundColor: "#7f6ddc34",
                            transition: "all 0.2s ease",
                            '&:active': {
                                backgroundColor: "#765cf831",
                                transform: "scale(0.98)",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                            }
                        }}
                        onClick={clearAllFilters}
                        variant="outlined"
                    >
                        <MdOutlineRefresh />
                        בטל סינון
                    </Button>
                )}
            </div>

            {/* ממשק הסינון המתקדם */}
            {showFilters && (
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9ff",
                    border: "1px solid #e0e0e0",
                    marginBottom: "20px"
                }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
                        {/* סינון לפי אימייל */}
                        <TextField
                            variant="outlined"
                            size="small"
                            label="סנן לפי אימייל"
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                        />

                        {/* סינון לפי עיר */}
                        <TextField
                            variant="outlined"
                            size="small"
                            label="סנן לפי עיר"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                        />

                        {/* סינון לפי סוג סליקת אשראי */}
                        <FormControl variant="outlined" size="small">
                            <InputLabel>סוג סליקת אשראי</InputLabel>
                            <Select
                                value={paymentTypeFilter}
                                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                                label="סוג סליקת אשראי"
                            >
                                <MenuItem value="">הכל</MenuItem>
                                <MenuItem value="nedarim">נדרים</MenuItem>
                                <MenuItem value="gizbar">גזבר</MenuItem>
                                <MenuItem value="none">ללא</MenuItem>
                            </Select>
                        </FormControl>

                        {/* סינון לפי מספר לקוחות */}
                        <FormControl variant="outlined" size="small">
                            <InputLabel>מספר לקוחות</InputLabel>
                            <Select
                                value={customersCountFilter}
                                onChange={(e) => setCustomersCountFilter(e.target.value)}
                                label="מספר לקוחות"
                            >
                                <MenuItem value="">הכל</MenuItem>
                                <MenuItem value="0">0 לקוחות</MenuItem>
                                <MenuItem value="1-10">1-10 לקוחות</MenuItem>
                                <MenuItem value="11-50">11-50 לקוחות</MenuItem>
                                <MenuItem value="50+">50+ לקוחות</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    {/* סינון לפי תאריך הצטרפות */}
                    <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", color: "#555", minWidth: "fit-content" }}>
                            תאריך הצטרפות:
                        </span>
                        <TextField
                            variant="outlined"
                            size="small"
                            type="date"
                            label="מתאריך"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            style={{ minWidth: "150px" }}
                        />
                        <TextField
                            variant="outlined"
                            size="small"
                            type="date"
                            label="עד תאריך"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            style={{ minWidth: "150px" }}
                        />
                    </div>
                </Box>
            )}
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
                        <th className="td-no-border">צפייה במשתמש</th>
                        <th className="td-no-border">פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(agent => (
                        <tr key={agent._id}>
                            <td>
                                {agent.first_name}
                            </td>
                            <td>
                                {agent.last_name}
                            </td>
                            <td>
                                {agent.createdAt?.slice(0, 10)}
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
                            <td className="btn-customer-list">
                                <span
                                    onClick={() => openViewAgentModal(agent)}
                                    style={{ cursor: "pointer", color: "gray" }}
                                    className="customers-list-btn customers-list-view"
                                >
                                    <PiEyeThin size={20} />
                                </span>
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
                                            onClick={() => openMessageModal(agent)}
                                        >
                                            <LuBellRing size={20} /> שלח הודעה
                                        </div>

                                        <div
                                            onClick={() => {
                                                console.log("Delete agent clicked:", agent._id);
                                                // openDeleteModel(agent);
                                                closeMenu();
                                            }}
                                            className="action-item"
                                            style={{ color: "#dc3545" }}
                                        >
                                            <GrFormTrash size={20} /> מחיקה
                                        </div>

                                        <div
                                            className="action-item"
                                            onClick={() => {
                                                console.log("Reset password for agent:", agent._id);
                                                closeMenu();
                                            }}
                                        >
                                            🔑 איפוס סיסמה
                                        </div>

                                        <div
                                            className="action-item"
                                            onClick={() => {
                                                console.log("Toggle agent status:", agent._id);
                                                closeMenu();
                                            }}
                                        >
                                            {agent.active !== false ? "🚫 השבת משתמש" : "✅ הפעל משתמש"}
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

            {/* מודאל לצפייה במשתמש */}
            <Modal isOpen={isViewAgentModalOpen} onClose={() => setViewAgentModalOpen(false)}>
                <AgentDetailsView
                    agent={selectedAgentForView}
                    onClose={() => setViewAgentModalOpen(false)}
                />
            </Modal>

            {/* מודאל להודעה אישית */}
            <Modal isOpen={isMessageModalOpen} onClose={() => setMessageModalOpen(false)}>
                <SendMessageToAgent
                    agent={selectedAgentForMessage}
                    onSuccess={() => setMessageModalOpen(false)}
                />
            </Modal>

            {/* מודאל להודעה קבוצתית */}
            <Modal isOpen={isBulkMessageModalOpen} onClose={() => setBulkMessageModalOpen(false)}>
                <BulkMessageToAgents
                    agents={filteredData}
                    onSuccess={() => setBulkMessageModalOpen(false)}
                />
            </Modal>

        </div>
    )
}
export default AgentsList