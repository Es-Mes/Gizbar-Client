import "./loginPage.css"
import { useChangePasswordMutation, useForgotPasswordMutation, useLoginMutation } from "../authApiSlice"
import { useEffect, useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom"
import { NavLink } from "react-router-dom/dist/umd/react-router-dom.development"
import useAuth from "../../../hooks/useAuth"
import { Link } from "react-router-dom"
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import LoadingScreen from "../../../component/LoadingScreen";
import { useSelector } from "react-redux";

export const LoginPage = () => {
  // const { _id, phone, roles } = useAuth()
  const { _id, phone } = useAuth()
  const [login, { isError, error, isLoading, isSuccess, data }] = useLoginMutation()
  const [forgotPassword, { isError: isSendPassErr, error: sendPassErr, isLoading: isSendPassLoading }] = useForgotPasswordMutation()
  const [changePassword, { isError: isChangePassErr, error: changePassErr, isLoading: isChangePassLoading }] = useChangePasswordMutation()
  const navigate = useNavigate()
  let userObj = {}
  const RESEND_TIMEOUT = 60; // בשניות

  const [loginStep, setLoginStep] = useState("login");

  const [phoneSendPass, setPhoneSendPass] = useState(null)
  const [code, setCode] = useState(null)
  const [newPassword, setNewPassword] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loginErr,setLoginErr] = useState()

  //ספירה לאחור לשליחת קוד חדש
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);


  const [showPassword, setShowPassword] = useState(false); // ניהול תצוגת הסיסמה

  useEffect(() => {
    if (!canResend) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canResend]);

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
  e.preventDefault();
  const data = new FormData(e.target);
  const userObj = Object.fromEntries(data.entries());
  setLoginErr(null); // נקה שגיאה קודמת

  try {
    const result = await login(userObj).unwrap(); // כאן ייזרק שגיאה במקרה הצורך
    // אם הצליח - את יכולה לעשות הפניות/ניקוי שדות וכו'
    console.log("Login success:", result);
  } catch (err) {
    const message = err?.data?.message;

    if (message === "Unauthorized - Agent not found") {
      setLoginErr("משתמש לא קיים");
    } else if (message === "Unauthorized, wrong password") {
      setLoginErr("סיסמה שגויה");
    } else if (message?.includes("phone")) {
      setLoginErr("מספר טלפון לא תקין, יש לכתוב ספרות בלבד");
    } else {
      setLoginErr("שגיאה בלתי צפויה, נסה שוב");
    }
  }
};

  const sendForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("")
    try {
      console.log(`sendForgotPassword ${phoneSendPass}`);
      const result = await forgotPassword({ phone: phoneSendPass });

      // בדיקה אם יש error מהשרת
      if (result.error) {
        const message = result.error.data?.message || "שגיאה לא ידועה";
        console.error("שגיאת שרת:", message);
        setErrorMsg("שגיאת שרת");
        if (message === "Agent not found")
          setErrorMsg("משתמש לא קיים");
        return; // לא עוברים לשלב הבא
      }

      // הצלחה
      console.log("שליחה מחדש של הקוד...");
      setCanResend(false);
      setCountdown(RESEND_TIMEOUT);
      setLoginStep("showChangePass");
      console.log("הקוד נשלח בהצלחה");
    } catch (error) {
      console.error("שגיאת רשת:", error);
      setErrorMsg("שגיאת רשת בלתי צפויה. נסה שוב.");
    }
  };


  const sendChangePassword = async (e) => {
    setPasswordError("")
    setErrorMsg("")
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות');
      return;
    }
    try {
      console.log(`sendChangePass code${code} new${newPassword} phone${phoneSendPass}`);
      const result = await changePassword({ phone: phoneSendPass, code, newPassword });
      if (result.error) {
        const message = result.error.data?.message || "שגיאה לא ידועה";
        console.error("שגיאת שרת:", message);
        setErrorMsg("שגיאת שרת");
        if (message === "Agent not found")
          setErrorMsg("משתמש לא קיים");
        if (message === "Unauthorized, wrong old password")
          setErrorMsg("סיסמא קודמת לא תקינה");
        if (message === "Invalid or expired reset code")
          setErrorMsg("קוד טלפוני לא תקין");
        return; // לא עוברים לשלב הבא
      }
      setTimeout(() => {
        setErrorMsg("הסיסמא שונתה בהצלחה, הנך מועבר לדף הכניסה")
        setLoginStep("login")
      }, 2000)
      setErrorMsg("")
    } catch (error) {
      console.error("שגיאת רשת:", error);
      setErrorMsg("שגיאת רשת בלתי צפויה. נסה שוב.");
    }



  }

  const handleGoHome = () => {
    navigate("/")
  }
  if (isLoading) {

    return (<><LoadingScreen /></>)
  }
  switch (loginStep) {
    case "phone":
      return (
        <div className='login-page'>
          <div className="login-form">
            <form id="loginForm" className='login-page-form'>
              <div className="rotating-coin"><img src="/icons8-coin-50.png"/></div>
              <h2>הכנס טלפון לזיהוי</h2>
              <div className="field">
                <label htmlFor="phone">טלפון</label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  required
                  onChange={(e) => { setPhoneSendPass(e.target.value) }}
                />
              </div>
              <p style={{ color: "#f9a825" }}>{errMsg}</p>
              <button disabled={isSendPassLoading} onClick={sendForgotPassword}>
                {isSendPassLoading ? 'בתהליך...' : 'הבא'}
              </button>
            </form>

            <div className="toRegist">
              <Link onClick={() => { setLoginStep("login"); setErrorMsg("") }}>חזרה לעמוד הכניסה</Link>
            </div>
          </div>
          <img className="loginImg" src="/loginImg.png" alt="" />
        </div>
      )
    case "showChangePass":
      return (
        <div className='login-page'>
          <div className="login-form">
            <form id="loginForm" className='login-page-form'>
              <div className="rotating-coin"><img src="/icons8-coin-50.png"/></div>
              <h2>שינוי סיסמא</h2>
              <p>קוד טלפוני נשלח למספר שהזנת</p>
              <div className="field">
                <div className="password-wrapper">

                  <input
                    type="text"
                    placeholder="הכנס קוד טלפוני"
                    name="phonePassword"
                    id="phonePassword"
                    onChange={(e) => { setCode(e.target.value) }}
                    required
                    autoComplete="one-time-code"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="password">סיסמא חדשה</label>
                <div className="password-wrapper">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    onChange={(e) => { setNewPassword(e.target.value) }}
                    required
                    autoComplete="new-password"
                  />
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              <div className="field">
                <label htmlFor="password">אימות סיסמא חדשה</label>
                <div className="password-wrapper">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword2"
                    id="newPassword2"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
              {isChangePassErr && (
                <p style={{ color: "#f9a825" }}>{errMsg}</p>

              )}
              <button disabled={isChangePassLoading} onClick={sendChangePassword}>
                {isChangePassLoading ? 'בתהליך...' : 'הבא'}
              </button>
            </form>

            <div className="toRegist">
              {!canResend ? (
                <span style={{ color: "gray" }}>
                  ניתן לשלוח שוב בעוד {countdown} שניות
                </span>
              ) : (
                <Link style={{ color: "#4c3b75dc" }} onClick={sendForgotPassword}>לא קיבלתי, שלח שוב קוד טלפוני</Link>)}
              <Link onClick={() => {
                setLoginStep("login");
                setPasswordError("")
              }}>חזרה לעמוד הכניסה</Link>
            </div>
          </div>
          <img className="loginImg" src="/loginImg.png" alt="" />
        </div>
      )
    case "login":
      return (
        <div className='login-page'>
          <div className="login-form">
            <form id="loginForm" onSubmit={handleSubmit} className='login-page-form'>
              <div className="rotating-coin"><img src="/icons8-coin-50.png"/></div>
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
                    autoComplete="current-password"	
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
                  {loginErr}
                </Alert>
              )}
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'בתהליך...' : 'כניסה'}
              </button>
            </form>

            <div className="toRegist">
              <NavLink onClick={() => { setLoginStep("phone") }}> שכחתי סיסמה</NavLink>
              <NavLink to='/regist'> עדיין לא השתמשת במערכת? לחץ כאן</NavLink>
            </div>
          </div>
          <img className="loginImg" src="/loginImg.png" alt="" />
        </div>
      )
  }





}

export default LoginPage