import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useChangePasswordWithTWTMutation } from '../fetures/auth/authApiSlice'
import { Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from '../hooks/useAuth';

const ChangePasswordModal = ({ onSucsses }) => {
    const { phone } = useAuth()
    const [changePasswordWithTWT, { isError: isChangePassErr, error: changePassErr, isLoading: isChangePassLoading }] = useChangePasswordWithTWTMutation()
    const [oldPassword,setOldPassword] = useState(null)
    const [newPassword, setNewPassword] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [errMsg, setErrorMsg] = useState("")

    const [showPassword, setShowPassword] = useState(false); // ניהול תצוגת הסיסמה



    const sendChangePassword = async (e) => {
        setPasswordError("")
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPasswordError('הסיסמאות אינן תואמות');
            return;
        }
        try {
            console.log(`sendChangePass oldPassword${oldPassword} new${newPassword} phone${phone}`);
            const result = await changePasswordWithTWT({ phone, oldPassword, newPassword });
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
           toast.success("👍 הסיסמה שונתה בהצלחה",{icon:false});
            setTimeout(() => {
                onSucsses()
                setErrorMsg("")
            }, 2000)
        } catch (error) {
            console.error("שגיאת רשת:", error);
            setErrorMsg("שגיאת רשת בלתי צפויה. נסה שוב.");
        }



    }
       
            return (
                <div className="">
                    <div className="loading-box">
                        <div className=''>
                            <div className="">
                                <form id="loginForm" className='login-page-form'>
                                    <h2>שינוי סיסמא</h2>
                                    <div className="field">
                                        <label htmlFor="password">הכנס סיסמא קיימת</label>
                                        <div className="password-wrapper">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="oldPassword"
                                                    id="oldPassword"
                                                    onChange={(e) => { setOldPassword(e.target.value) }}
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
                            </div>
                        </div>
                    </div>
                </div>
            

)
}

export default ChangePasswordModal
