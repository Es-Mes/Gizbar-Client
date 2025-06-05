import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import { UseSelector, useSelector } from "react-redux";
import { selectToken } from "./authSlice";
import { useDispatch } from "react-redux";
import { setToken } from "./authSlice";



const PersistsLogin = () => {
    const token = useSelector(selectToken)
    console.log("token:", token)
    const effectRan = useRef(false)
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [trueSuccess, setTrueSuccess] = useState(false)

    const [refresh, {
        isUninitialized, isLoading, isSuccess, isError, error
    }] = useRefreshMutation()
      const needsReauth = useSelector((state) => state.auth.needsReauth);

    useEffect(() => {
            const verifyRefreshToken = async () => {
                console.log("verify refresh token");
                try {
                    await refresh().unwrap() // unwrap זורק שגיאה אם נכשל
                    setTrueSuccess(true)
                } catch (err) {
                    console.error('Refresh failed:', err)
                }
            }
            if (!token){
            verifyRefreshToken()
            } 
    }, [token,refresh])
    let content
    return (
    <>
        {isLoading && <h1>טוען נתונים...</h1>}
        {(isError || needsReauth) && (
            <div>
                <h6 className="errorMsg">
                    תוקף החיבור פג. אנא התחבר מחדש.
                </h6>
                <button onClick={() => navigate("/login")}>
                    חזור לדף ההתחברות
                </button>
            </div>
        )}
        {((isSuccess && trueSuccess) || (token && isUninitialized)) && <Outlet />}
    </>
);

}

export default PersistsLogin