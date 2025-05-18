import "./loginPage.css"
import { useLoginMutation } from "../authApiSlice"
import { useEffect, useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom"
import { NavLink } from "react-router-dom/dist/umd/react-router-dom.development"
import useAuth from "../../../hooks/useAuth"
import { Link } from "react-router-dom"
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import LoadingScreen from "../../../component/LoadingScreen";

export const LoginPage = () => {
  // const { _id, phone, roles } = useAuth()
  const { _id, phone } = useAuth()
  const [login, { isError, error, isLoading, isSuccess, data }] = useLoginMutation()
  const navigate = useNavigate()
  let userObj = {}

  const [showPassword, setShowPassword] = useState(false); // ניהול תצוגת הסיסמה

  useEffect(() => {
    if (isSuccess) {
      console.log(userObj);
      // if (roles === "admin")
      //   navigate("/dash")
      //this is the token!!
      console.log(data);
      // if (roles === "user")
      // navigate("/")
      navigate("/dash")
    }

  }, [isSuccess])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    userObj = Object.fromEntries(data.entries())
    console.log(userObj.phone)
    login(userObj)
    // document.getElementById("loginForm").requestSubmit(); // ניסוי לשליחה ידנית
  }

  const handleGoHome = () => {
    navigate("/")
  }
  if(isLoading){

    return(<><LoadingScreen/></>) 
  }
  return (
    <div className='login-page'>
      <div className="login-form">


      <form id="loginForm" onSubmit={handleSubmit} className='login-page-form'>
  <h2>מזדהים ומתחברים</h2>
  <div className="field">
    <label htmlFor="phone">טלפון</label>
    <input
      type="text"
      name="phone"
      id="phone"
      required
    />
  </div>
  <div className="field">
    <label htmlFor="password">סיסמה</label>
    <div className="password-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        id="password"
        required
      />
      <span
        className="eye-icon"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  </div>
  {isError && (
    <Alert className="error" variant="outlined" severity="error" style={{ color: 'red', minWidth: '350px' }}>
      {error && error.data?.message}
    </Alert>
  )}
  <button type="submit" disabled={isLoading}>
    {isLoading ? 'בתהליך...' : 'כניסה'}
  </button>
</form>

      <div className="toRegist">
       <NavLink to='/regist'> עדיין לא השתמשת במערכת? לחץ כאן</NavLink>
      </div>
      </div>
      <img className="loginImg" src="/loginImg.jpg" alt="" />
    </div>
  )
}

export default LoginPage