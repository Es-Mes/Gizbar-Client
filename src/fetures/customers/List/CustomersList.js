import "./CustomersList.css"
// import "./new.css"
import Search from "../../../component/search/Search"
import { useDeleteCustomerMutation } from "../customersApiSlice"
import { Link, useSearchParams } from "react-router-dom"
import { MdDelete, MdDeleteOutline, MdViewList, MdViewColumn } from "react-icons/md"
import { GrView, GrEdit } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux"
import useAuth from "../../../hooks/useAuth"
import { deleteCustomerData } from "../../../app/customersSlice"
import { useState } from "react"
import Modal from "../../../modals/Modal"
import EditCustomer from "../edit/EditCustomer"
import AddCustomer from "../add/AddCustomer"

const CustomersList = () => {
    const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן

    const dispatch = useDispatch()
    const customers = useSelector((state) => state.customers?.customers || []);
    // console.log(customers);

    const [isEditModelOpen, setEditModelOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [isAddModelOpen, setAddModelOpen] = useState(false)
    // const { data: custmers, isError, error, isLoading } = useGetAllCustomersQuery()
    const [deleteCustomer, { isSuccess: isDeleteSuccess }] = useDeleteCustomerMutation()

    const openEditModel = (customer) => {
        setSelectedCustomer(customer);
        setEditModelOpen(true);
    }

    const addCustomerClick = () => {
        setAddModelOpen(true);
    }
    const deleteClick = async (customer) => {
        if (window.confirm("?בטוח שברצונך למחוק את הלקוח")) {
            console.log(customer);

            const data = await deleteCustomer({ phone, _id: customer._id })
            console.log('data : ', data);

            if (data.data) {
                if (!data.error) {
                    dispatch(deleteCustomerData(customer._id));
                }
            } else {
                if (data.error.status === 403) {
                    window.alert("אין אפשרות למחוק לקוח שיש לו עסקאות.")
                }
            }

        }
    }

    const [searchParams] = useSearchParams()
    const q = searchParams.get("")

    // if (isLoading) return <h1>loading...</h1>
    // if (isError) return <h1>{JSON.stringify(error)}</h1>

    const filteredData = !q ? [...customers] : customers.filter(c => c.full_name.indexOf(q) > -1)

    return (
        <div className="customers-list">
            <h2 className="customers-title">לקוחות</h2>
            <div className="customers-list-top">
                <Search placeholder={"חיפוש לפי שם לקוח"} />
                {/* <Link to="/dash/customers/add" className="customers-list-add-btn">
                    הוספת משתמש
                </Link> */}
                <button onClick={addCustomerClick}>
                    {/* <Link to="add"> */}
                    הוספת לקוח
                    {/* </Link> */}
                </button>
            </div>
            <table className="customers-list-table">
                <thead className="tHeads">
                    <tr>
                        <td className="td-no-border">שם</td>
                        <td className="td-no-border">טלפון</td>
                        <td className="td-no-border">אימייל</td>
                        <td className="td-no-border">כתובת</td>
                        <td className="td-no-border">עיר</td>
                        <td className="td-no-border">צפייה</td>
                        <td className="td-no-border">עריכה</td>
                        <td className="td-no-border">מחיקה</td>
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
                            <td>
                                {customer.email}
                            </td>
                            <td>
                                {customer.address}
                            </td>
                            <td>
                                {customer.city}
                            </td>
                            <td className="btn-customer-list">
                                {/* <Link to={`/dash/customers/${customer._id}`} className="customers-list-btn customers-list-view"> */}
                                <GrView size={20} color="green" />
                                {/* </Link> */}
                            </td>
                            <td className="btn-customer-list edit_btn" onClick={() => openEditModel(customer)}>
                                {/* <Link to={`/dash/customers/${customer._id}`} className="customers-list-btn customers-list-view"> */}
                                <GrEdit size={20} color="teal" />
                                {/* </Link> */}
                            </td>
                            <td className="btn-customer-list delete-byn-list" onClick={() => deleteClick(customer)}>
                                <MdDelete size={20} color="red" />
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
                    onSuccess={() => setEditModelOpen(false)} />
            </Modal>
            <Modal isOpen={isAddModelOpen} onClose={() => setAddModelOpen(false)}>
                <AddCustomer
                    onSuccess={() => setAddModelOpen(false)} />
            </Modal>

        </div>
    )
}
export default CustomersList