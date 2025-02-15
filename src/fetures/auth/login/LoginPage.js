import "./loginPage.css"
import { useLoginMutation } from "../authApiSlice"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { NavLink } from "react-router-dom/dist/umd/react-router-dom.development"
import useAuth from "../../../hooks/useAuth"
import { Link } from "react-router-dom"
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export const LoginPage = () => {
  // const { _id, phone, roles } = useAuth()
  const { _id, phone } = useAuth()
  const [login, { isError, error, isLoading, isSuccess, data }] = useLoginMutation()
  const navigate = useNavigate()
  let userObj = {}

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

  return (
    <div className='login-page'>
      <form id="loginForm" onSubmit={handleSubmit} className='login-page-form'>
        <button onClick={handleGoHome} className="exit"><Link to='/' />x</button>
        <img src="/slika/SlikaLogo.ICO" style={{ minHeight: "150px" }} />
        <h1>כניסת משתמשים</h1>
        {/* <input type='text' required name='phone' id='phone' placeholder="פלאפון" /> */}
        {/* <input type='password' required name='password' id='password' placeholder='ססמא' /> */}
        <div className="field">
          <div className="required-wrapper">
            <span className="required-asterisk">*</span>
          </div>
          <input
            type="text"
            name="phone"
            id="phone"
            placeholder="טלפון"
            required
          />
        </div>
        <div className="field">
          <div className="required-wrapper">
            <span className="required-asterisk">*</span>
          </div>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="סיסמה"
            required
          />
        </div>
        {isError &&
          <Alert className="error" variant="outlined" severity="error" style={{ color: 'red', minWidth: '350px' }}>
            {error && error.data?.message}
          </Alert>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'בתהליך...' : 'כניסה'}
        </button>
      </form>
      <div className="toRegist">
        <h1 className="h1ToRegist">חדש באתר?</h1>
        <button><NavLink to='/regist'>הרשם עכשיו!</NavLink></button>
      </div>

      <div>

      </div>
    </div>
  )
}

export default LoginPage