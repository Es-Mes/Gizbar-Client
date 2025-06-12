import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { selectToken, logout } from "./authSlice";
import SessionExpiredModal from "../../modals/SessionExpiredModal ";

const PersistsLogin = () => {
  const token = useSelector(selectToken);
  const needsReauth = useSelector((state) => state.auth.needsReauth);
  const [trueSuccess, setTrueSuccess] = useState(false);
  const effectRan = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Token from Redux:", token);
  }, [token]);

  const [refresh, {
    isUninitialized,
    isLoading,
    isSuccess,
    isError,
    error
  }] = useRefreshMutation();

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      refresh().unwrap().catch((err) => {
        console.error("Auto-refresh failed", err);
      });
    }, 5 * 60 * 1000); // כל 5 דקות

    return () => clearInterval(interval);
  }, [token, refresh]);


  // מנסה לרענן טוקן אם אין כזה
  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh().unwrap();
        setTrueSuccess(true);
      } catch (err) {
        console.error("Refresh failed:", err);
      }
    };

    if (!token && !effectRan.current) {
      verifyRefreshToken();
    }

    return () => {
      effectRan.current = true;
    };
  }, [token, refresh]);

  // 💡 טיפ: כאשר צריך הפניה אקטיבית בעת פקיעת תוקף
  useEffect(() => {
    if (needsReauth) {
      // כאן אפשר להוסיף פעולות נוספות אם רוצים
      console.warn("Session expired. Redirecting to login...");
    }
  }, [needsReauth]);

  const handleLoginRedirect = () => {
    dispatch(logout()); // כדי לנקות גם את הטוקן מה־store
    navigate("/login");
  };

  // 💡 תעדוף: טוען → שגיאה (אם אין הצלחה) → תוכן תקין → כלום
  if (isLoading) {
    return <h1>טוען נתונים...</h1>;
  }

  const shouldShowError = isError || needsReauth;

console.log({ isError, needsReauth, isSuccess, trueSuccess, token, isUninitialized });

  if (shouldShowError) {
    return (
      <SessionExpiredModal handleLoginRedirect={handleLoginRedirect} />
    );
  }

 if (trueSuccess || (token && !isLoading && !isError && isUninitialized)) {
  return <Outlet />;
}



  return null;
};

export default PersistsLogin;
