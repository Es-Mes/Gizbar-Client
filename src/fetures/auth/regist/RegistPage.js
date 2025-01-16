import "./registPage.css"
import { useRegistMutation } from "../authApiSlice"
import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import Alert from '@mui/material/Alert';

export const RegistPage = () => {

  const [regist, { isError, error, isLoading, isSuccess, data }] = useRegistMutation()
  const navigate = useNavigate()
  const [fullData, setFullData] = useState(false)
  const [first_name, setFirst_name] = useState("")
  const [last_name, setLast_name] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState("")
  const [passwordError, setPasswordError] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState("")
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const modalRef = useRef(null);  // רפרנס למודאל

  useEffect(() => {
    // כשנטען המודאל - גלול אליו
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    if (isSuccess) {
      console.log('Registration successful:', data);
      setShowWelcomeMessage(true);
      setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 2010);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  }, [isSuccess]);

  useEffect(() => {
    checkFull()
    
  // }, [first_name, password, phone]) לעדכן סופית כל מה שנדרש ברישום!
}, [confirmPassword, password, phone])

  const handleSubmit = async (e) => {
    e.preventDefault()
     // בדיקה אם הסיסמאות תואמות
     if (password !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות');
      return;
  }
    const data = new FormData(e.target)
    const userObj = Object.fromEntries(data.entries())
    regist(userObj)
  }

  const checkFull = () => {
    // if (first_name && password && phone) {
    if (password && phone && confirmPassword) {
      setFullData(true)
    } else {
      setFullData(false)
    }
  }

  const handleGoHome = () => {
    navigate("/")
  }

  if (showWelcomeMessage) return (
    <div className="welcome-message">
      {first_name}<br />
      נרשמת בהצלחה למערכת, הינך מועבר לדף הכניסה.
    </div>
  );

  return (
    <div className='modal-overlay modal-static' ref={modalRef}>
      <div className='regist-page modal-content'>
        <form onChange={checkFull} onSubmit={handleSubmit} className='regist-page-form'>
          <button onClick={handleGoHome} className="exit registExit"><Link to='/' />x</button>
          <img src="/slika/SlikaLogo.ICO" style={{ minHeight: "150px" }} />
          <input type='text' name='first_name' id='first_name' onChange={(e) => setFirst_name(e.target.value)} placeholder="שם פרטי" />
          <input type='text'  name='last_name'  onChange={(e) => setLast_name(e.target.value)} id='last_name' placeholder="שם משפחה" />
          <input type='text' required name='phone' onChange={(e) => setPhone(e.target.value)} id='phone' placeholder="טלפון" />
          <input type='email'  name='email' onChange={(e) => setEmail(e.target.value)} id='email' placeholder="אימייל" />
          <input type='text'  name='city' onChange={(e) => setCity(e.target.value)} id='city' placeholder="עיר" />
          <input type='text'  name='address' onChange={(e) => setAddress(e.target.value)} id='address' placeholder="כתובת" />
          <input type='password' required name='password' onChange={(e) => setPassword(e.target.value)} id='password' placeholder='סיסמה' />
          <input type='password' required name='confirmPassword' onChange={(e) => setConfirmPassword(e.target.value)} id='confirmPassword' placeholder='אימות סיסמה' />
          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}

          <Link className="linkToLogin" to={"/login"}>לקוח רשום? הכנס כאן!</Link>
          {isError &&
            <Alert className="error" variant="outlined" severity="error" style={{ color: 'red', minWidth: '350px' }}>
              {error && error.data?.message}
            </Alert>}
          <button type='submit' style={{ backgroundColor: fullData ? 'var(--green)' : "var(--blue)", color: !fullData && "white" }}>רישום</button>
        </form>
      </div>
    </div>
  )
}

export default RegistPage
