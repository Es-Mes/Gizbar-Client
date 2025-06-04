import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import { UseSelector, useSelector } from "react-redux";
import { selectToken } from "./authSlice";
import { useDispatch } from "react-redux";
import { setToken } from "./authSlice";



const PersistsLogin = () => {
    const token = useSelector(selectToken)
    const effectRan = useRef(false)
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [trueSuccess, setTrueSuccess] = useState(false)

    const [refresh, {
        isUninitialized, isLoading, isSuccess, isError, error
    }] = useRefreshMutation()
      const needsReauth = useSelector((state) => state.auth.needsReauth);

    useEffect(() => {
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') {
            const verifyRefreshToken = async () => {
                console.log("verify refresh token");
                try {
                    await refresh().unwrap() // unwrap זורק שגיאה אם נכשל
                    setTrueSuccess(true)
                } catch (err) {
                    console.error('Refresh failed:', err)
                }
            }
            if (!token) verifyRefreshToken()
        }
        return () => effectRan.current = true
    }, [])
    let content
    if (isLoading) {
        console.log("loading");
        content = <h1>טוען נתונים</h1>
    } else if (isError || needsReauth) {
        console.log("error");
        content = <div>
            <h6 className="errorMsg">
                תוקף החיבור פג. אנא התחבר מחדש.
            </h6>
            <button color="primery" onClick={() => navigate("/login")}>
                חזור לדף ההתחברות
            </button>
        </div>
    } else if (isSuccess && trueSuccess) {
        // console.log("success");
        content = <Outlet />
    } else if (token && isUninitialized) {
        // console.log("token and Uninitialized");
        // console.log(isUninitialized);
        content = <Outlet />
    }
    return content
}

export default PersistsLogin