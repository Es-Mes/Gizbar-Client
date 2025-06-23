import "./registPage.css"
import { useRegistMutation } from "../authApiSlice"
import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import Alert from '@mui/material/Alert';
import LoadingScreen from "../../../component/LoadingScreen";

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
  const [passwordError, setPasswordError] = useState(null);
const [registerError, setRegisterError] = useState(null);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState("")
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const modalRef = useRef(null);  // רפרנס למודאל
  const errRef = useRef(null)

  useEffect(() => {
    // כשנטען המודאל - גלול אליו
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
  if (registerError || passwordError) {
    errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}, [registerError, passwordError]);


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
  e.preventDefault();

  // בדיקה אם הסיסמאות תואמות
  if (password !== confirmPassword) {
    setPasswordError('הסיסמאות אינן תואמות');
    return;
  }

  const data = new FormData(e.target);
  const userObj = Object.fromEntries(data.entries());
  delete userObj.confirmPassword;

  setPasswordError(null);
  setRegisterError(null); // שגיאה כללית מהשרת

  try {
    const result = await regist(userObj).unwrap(); // שולף תשובה או זורק שגיאה
    console.log("ההרשמה הצליחה:", result);
    // כאן אפשר לעשות redirect או הודעת הצלחה
  } catch (err) {
    console.log("שגיאה מהשרת בהרשמה:", err);
    const message = err?.data?.message;

    if (message?.includes("phone")) {
      setRegisterError("מספר טלפון לא תקין או כבר בשימוש");
    } else if (message?.includes("email")) {
      setRegisterError("אימייל לא תקין או כבר קיים");
    } else if (message?.includes("password")) {
      setRegisterError("סיסמה לא תקינה (לפחות 6 תווים)");
    } else {
      setRegisterError("שגיאה כללית בהרשמה, נסה שוב");
    }
  }
};


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
  if(isLoading){
    return <LoadingScreen/>
  }

  return (
    <div className='modal-overlay modal-static regist-modal'
      style={{ 
      backgroundImage: `url(${process.env.PUBLIC_URL}/loginImg.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }} ref={modalRef}>
      <div className='regist-page modal-content'>
        
        <form id="registForm" onChange={checkFull} onSubmit={handleSubmit} className='regist-page-form'>
        <h2>משתמש חדש במערכת</h2>
          {/* <button onClick={handleGoHome} className="exit registExit"><Link to='/' />x</button> */}
          {/* <img src="/slika/SlikaLogo.ICO" style={{ minHeight: "150px" }} /> */}

          <div className="field">
            <div className="required-wrapper">
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="text"
              name="first_name"
              id="first_name"
              onChange={(e) => setFirst_name(e.target.value)}
              value={first_name}
              placeholder="שם פרטי"
            required
            />
          </div>

          <div className="field">
            <div className="required-wrapper">
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="text"
              name="last_name"
              id="last_name"
              onChange={(e) => setLast_name(e.target.value)}
              value={last_name}
              placeholder="שם משפחה"
            required
            />
          </div>

          <div className="field">
            <div className="required-wrapper">
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="text"
              name="phone"
              id="phone"
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              placeholder="טלפון"
              required
            />
          </div>

          <div className="field">
            <div className="required-wrapper">
              {/* <span className="required-asterisk">*</span> */}
            </div>
            <input
              type="email"
              name="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="אימייל"
            // required
            />
          </div>

          <div className="field">
            <div className="required-wrapper">
              {/* <span className="required-asterisk">*</span> */}
            </div>
            <input
              type="text"
              name="city"
              id="city"
              onChange={(e) => setCity(e.target.value)}
              value={city}
              placeholder="עיר"
            />
          </div>

          <div className="field">
            <div className="required-wrapper">
              {/* <span className="required-asterisk">*</span> */}
            </div>
            <input
              type="text"
              name="address"
              id="address"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              placeholder="כתובת"
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
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="סיסמה"
              required
            />
          </div>
          <div className="field">
            <div className="required-wrapper">
              <span className="required-asterisk">*</span>
            </div>
            <input
              type="password"
              required
              name="confirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirmPassword"
              value={confirmPassword}
              placeholder="אימות סיסמה"
            />
          </div>

          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}

          <Link className="linkToLogin" to={"/login"}>רשום כבר במערכת? הכנס כאן!</Link>
          <div  ref={errRef}>
            {passwordError && <p style={{textAlign:"center",fontWeight:"bold"}} className="error">{passwordError}</p>}
            {registerError && <p style={{textAlign:"center",fontWeight:"bold"}} className="error">{registerError}</p>}
          </div>

          <button type="submit" disabled={isLoading || !fullData} style={{ backgroundColor: fullData ? 'var(--text)' : "var(--bgSoftLight)", color: fullData && "white" }}>
            {isLoading ? 'בתהליך...' : 'והתחברת!'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegistPage
