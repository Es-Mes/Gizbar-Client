import "./AddCustomer.css"
import { useAddCustomerMutation } from "../customersApiSlice"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
const AddCustomer = () => {
    const [addUser, { error, isError, isLoading, isSuccess }] = useAddCustomerMutation()
    const navigate = useNavigate()
    useEffect(() => {
        if (isSuccess) {
            navigate("/dash/users")
        }
    }, [isSuccess])
    const formSubmit = (e) => {
        e.preventDefault()
        const data = new FormData(e.target)
        const userObj = Object.fromEntries(data.entries())
        console.log(userObj)
        addUser(userObj)
    }
    return (
        <div className="add-user-container">
            <form onSubmit={formSubmit} className="add-user-form">
                <input type="text" name="name" placeholder="שם מלא" required />
                <input type="text" name="userName" placeholder="שם משתמש" required />
                <input type="email" name="email" placeholder="כתובת מייל" required />
                <input type="tel" name="phone" placeholder="מספר פלאפון" />
                <input type="password" name="password" placeholder="סיסמא" required />
                {/* <input type="file" name="image"/> */}
                <button type="submit">אישור</button>
            </form>
        </div>
    )
}
export default AddCustomer