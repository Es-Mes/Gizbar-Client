import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useRefreshMutation } from "./authApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { selectToken, logout,setNeedsReauth } from "./authSlice";
import SessionExpiredModal from "../../modals/SessionExpiredModal ";
import useAuthStatus from "../../hooks/useAuthStatus"; // ייבוא של ה-hook החדש

const PersistsLogin = () => {
  const { token, isExpired } = useAuthStatus(); // שימוש ב-hook
  const needsReauth = useSelector((state) => state.auth.needsReauth);
  const expirationTime = useSelector((state) => state.auth.expirationTime);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const effectRan = useRef(false);

  const [refresh, { isLoading, isSuccess, isError, isUninitialized }] = useRefreshMutation();

  useEffect(() => {
  if (!token || !expirationTime) return;

  const now = Date.now();
  const timeToExpiry = expirationTime * 1000 - now;

  if (timeToExpiry <= 0) {
    // כבר פג
    dispatch(setNeedsReauth());
    return;
  }

  const timeout = setTimeout(() => {
    dispatch(setNeedsReauth());
  }, timeToExpiry);

  return () => clearTimeout(timeout);
}, [token, expirationTime, dispatch]);

  useEffect(() => {
    if (!token) return;

   // מרווח זמן קצר לפני שהטוקן פג כדי לרענן אותו
    const fiveMinutes = 5 * 60 * 1000;
    const interval = setInterval(() => {
        // רענן רק אם הטוקן עומד לפוג אבל עדיין לא פג
        refresh().catch((err) => console.error("Auto-refresh failed:", err));
    }, fiveMinutes); // לדוגמה, כל 5 דקות

    return () => clearInterval(interval);
  }, [token, refresh]);

  // ניסיון רענון אם אין טוקן
  useEffect(() => {
    if (!token && localStorage.getItem("persist")) {
      if (!effectRan.current) {
        refresh().catch((err) => console.error("Initial refresh failed:", err));
      }
      return () => { effectRan.current = true };
    }
  }, [token, refresh]);

  const handleLoginRedirect = () => {
    dispatch(logout());
    navigate("/login");
  };

  // תנאי הצגה
  // תנאי הצגה (גרסה מקוצרת)
  let content;
  if (isLoading) {
    content = <div className="fullscreen-cover">טוען נתונים...</div>;
  } else if (isExpired || needsReauth) { // איחדנו את התנאים
    // אם הסשן פג (לפי בדיקת זמן) או שקריאת API נכשלה
    content = <SessionExpiredModal handleLoginRedirect={handleLoginRedirect} />;
  } else if (token) {
    // אם יש טוקן והוא בתוקף
    content = <Outlet />;
  } else {
    // מצב ביניים או fallback אם אין טוקן ואין טעינה
    content = <div className="fullscreen-cover">ממתין לאימות...</div>; 
  }

  return content;
};

export default PersistsLogin;
