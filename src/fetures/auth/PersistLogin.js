import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useRefreshMutation } from "./authApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { selectToken, logout, setNeedsReauth } from "./authSlice";
import SessionExpiredModal from "../../modals/SessionExpiredModal ";
import useAuthStatus from "../../hooks/useAuthStatus";

const PersistsLogin = () => {
  const { token, isExpired } = useAuthStatus();
  const needsReauth = useSelector((state) => state.auth.needsReauth);
  const expirationTime = useSelector((state) => state.auth.expirationTime);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const effectRan = useRef(false);
  const lastActivityRef = useRef(Date.now());

  const [refresh, { isLoading }] = useRefreshMutation();

  // ⏰ מחשב מתי הטוקן יפוג ומפעיל setNeedsReauth
  useEffect(() => {
    if (!token || !expirationTime) return;

    const now = Date.now();
    const timeToExpiry = expirationTime * 1000 - now;

    if (timeToExpiry <= 0) {
      dispatch(setNeedsReauth());
      return;
    }

    const timeout = setTimeout(() => {
      dispatch(setNeedsReauth());
    }, timeToExpiry);

    return () => clearTimeout(timeout);
  }, [token, expirationTime, dispatch]);

  // 🔄 רענון אוטומטי רק אם הייתה פעילות ב־10 דקות האחרונות
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;

      if (now - lastActivityRef.current <= tenMinutes) {
        refresh().catch((err) => console.error("Auto-refresh failed:", err));
      } else {
        console.log("Skipped refresh – no recent activity");
      }
    }, 55 * 60 * 1000); // כל 55 דקות

    return () => clearInterval(interval);
  }, [token, refresh]);

  // 🚨 חוסר פעילות במשך שעה → השעיה
  useEffect(() => {
    if (!token) return;

    let inactivityTimeout;

    const resetInactivityTimer = () => {
      lastActivityRef.current = Date.now(); // עדכון פעילות אחרונה
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        dispatch(setNeedsReauth());
      }, 60 * 60 * 1000); // שעה
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimeout);
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [token, dispatch]);

  // 🟡 ניסיון רענון ראשוני אם אין טוקן
  useEffect(() => {
    if (!token && localStorage.getItem("persist")) {
      if (!effectRan.current) {
        refresh().catch((err) => console.error("Initial refresh failed:", err));
      }
      return () => {
        effectRan.current = true;
      };
    }
  }, [token, refresh]);

  const handleLoginRedirect = () => {
    dispatch(logout());
    navigate("/login");
  };

  let content;
  if (isLoading) {
    content = <div className="fullscreen-cover">טוען נתונים...</div>;
  } else if (isExpired || needsReauth) {
    content = <SessionExpiredModal handleLoginRedirect={handleLoginRedirect} />;
  } else if (token) {
    content = <Outlet />;
  } else {
    content = <div className="fullscreen-cover">ממתין לאימות...</div>;
  }

  return content;
};

export default PersistsLogin;
