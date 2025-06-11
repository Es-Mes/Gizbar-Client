import React, { useState } from 'react'
import { useChangePasswordWithTWTMutation, useForgotPasswordMutation } from '../fetures/auth/authApiSlice'
import { Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from '../hooks/useAuth';

const ChangePasswordModal = ({ onSucsses }) => {
    const {phone} = useAuth()
    const [forgotPassword, { isError: isSendPassErr, error: sendPassErr, isLoading: isSendPassLoading }] = useForgotPasswordMutation()
    const [changePasswordWithTWT, { isError: isChangePassErr, error: changePassErr, isLoading: isChangePassLoading }] = useChangePasswordWithTWTMutation()
    const [changePasswordStep, setChangePasswordStep] = useState("phone")

    const [phoneSendPass, setPhoneSendPass] = useState(null)
  const [code, setCode] = useState(null)
  const [newPassword, setNewPassword] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errMsg, setErrorMsg] = useState("")

    const [showPassword, setShowPassword] = useState(false); // ניהול תצוגת הסיסמה
  


  //ספירה לאחור לשליחת קוד חדש
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);

    const RESEND_TIMEOUT = 60; // בשניות

    const sendForgotPassword = async (e) => {
        e.preventDefault();
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
            setChangePasswordStep("showChangePass");
            console.log("הקוד נשלח בהצלחה");
        } catch (error) {
            console.error("שגיאת רשת:", error);
            setErrorMsg("שגיאת רשת בלתי צפויה. נסה שוב.");
        }
    };


    const sendChangePassword = async (e) => {
        setPasswordError("")
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPasswordError('הסיסמאות אינן תואמות');
            return;
        }
        try {
            console.log(`sendChangePass code${code} new${newPassword} phone${phone}`);
            const result = await changePasswordWithTWT({ phone, code, newPassword });
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
            setErrorMsg("הסיסמא שונתה בהצלחה")
            setTimeout(() => {
                onSucsses()
                setErrorMsg("")
            }, 4000)
        } catch (error) {
            console.error("שגיאת רשת:", error);
            setErrorMsg("שגיאת רשת בלתי צפויה. נסה שוב.");
        }



    }
    switch (changePasswordStep) {
        case "phone":
            return (
                <div className='login-page'>
                    <div className="login-form">
                        <form id="loginForm" className='login-page-form'>
                            <div className="rotating-coin">🪙</div>
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
                            <Link onClick={() => { setChangePasswordStep("login") }}>חזרה לעמוד הכניסה</Link>
                        </div>
                    </div>
                </div>
            )
        case "showChangePass":
            return (
                <div className='login-page'>
                    <div className="login-form">
                        <form id="loginForm" className='login-page-form'>
                            <div className="rotating-coin">🪙</div>
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
                                {isSendPassLoading ? 'בתהליך...' : 'הבא'}
                            </button>
                        </form>

                        <div className="toRegist">
                            {!canResend ? (
                                <span style={{ color: "gray" }}>
                                    ניתן לשלוח שוב בעוד {countdown} שניות
                                </span>
                            ) : (
                                <Link onClick={sendForgotPassword}>לא קיבלתי, שלח שוב קוד טלפוני</Link>)}
                            <Link onClick={() => {
                                setChangePasswordStep("login");
                                setPasswordError("")
                            }}>חזרה לעמוד הכניסה</Link>
                        </div>
                    </div>
                </div>
            )

    }
}

export default ChangePasswordModal
