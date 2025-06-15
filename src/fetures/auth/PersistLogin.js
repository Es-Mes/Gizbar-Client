import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useRefreshMutation } from "./authApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { selectToken, logout } from "./authSlice";
import SessionExpiredModal from "../../modals/SessionExpiredModal ";

const PersistsLogin = () => {
  const token = useSelector(selectToken);
  const needsReauth = useSelector((state) => state.auth.needsReauth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const effectRan = useRef(false);

  const [refresh, { isLoading, isSuccess, isError, isUninitialized }] = useRefreshMutation();

  // רענון קבוע כל 5 דקות
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      refresh().unwrap().catch((err) => {
        console.error("Auto-refresh failed:", err);
      });
    }, 25 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, refresh]);

  // ניסיון רענון אם אין טוקן
  useEffect(() => {
    if (!token && !effectRan.current) {
      refresh().unwrap().catch((err) => {
        console.error("Initial refresh failed:", err);
      });
    }

    return () => {
      effectRan.current = true;
    };
  }, [token, refresh]);

  const handleLoginRedirect = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (isLoading) {
    return <div className="fullscreen-cover">טוען נתונים...</div>;
  }

  if (isError || needsReauth) {
    return <SessionExpiredModal handleLoginRedirect={handleLoginRedirect} />;
  }

  if (token || isSuccess) {
    return <Outlet />;
  }

  // fallback למניעת מסך לבן
  return <div className="fullscreen-cover">ממתין לאימות...</div>;
};

export default PersistsLogin;
