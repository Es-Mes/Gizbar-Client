import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import { useRefreshMutation } from "./authApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { logout, setNeedsReauth } from "./authSlice";
import SessionExpiredModal from "../../modals/SessionExpiredModal ";
import useAuthStatus from "../../hooks/useAuthStatus";
import {
  AUTH_TIMEOUTS,
  USER_ACTIVITY_EVENTS,
  AUTH_MESSAGES
} from "./authConstants";

const PersistsLogin = () => {
  const { token, isExpired } = useAuthStatus();
  const needsReauth = useSelector((state) => state.auth.needsReauth);
  const expirationTime = useSelector((state) => state.auth.expirationTime);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const effectRan = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const inactivityTimeoutRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  const [refresh, { isLoading }] = useRefreshMutation();

  // פונקציה לרענון טוקן מותנה בפעילות
  const refreshTokenIfActive = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // רק אם היתה פעילות בזמן המוגדר
    if (timeSinceLastActivity <= AUTH_TIMEOUTS.MAX_INACTIVE_TIME_FOR_REFRESH) {
      try {
        await refresh().unwrap();
        console.log(AUTH_MESSAGES.TOKEN_REFRESHED);
      } catch (error) {
        console.error(AUTH_MESSAGES.TOKEN_REFRESH_FAILED, error);
        dispatch(setNeedsReauth());
      }
    } else {
      console.log(AUTH_MESSAGES.NO_RECENT_ACTIVITY);
      dispatch(setNeedsReauth());
    }
  }, [refresh, dispatch]);

  // פונקציה לאיפוס טיימר חוסר פעילות
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // איפוס הטיימר הקיים
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // הגדרת טיימר חדש
    inactivityTimeoutRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      // בדיקה נוספת לוודא שבאמת עברה שעה מהפעילות האחרונה
      if (timeSinceLastActivity >= AUTH_TIMEOUTS.INACTIVITY_TIMEOUT) {
        console.log(AUTH_MESSAGES.USER_INACTIVE);
        dispatch(setNeedsReauth());
      }
    }, AUTH_TIMEOUTS.INACTIVITY_TIMEOUT);
  }, [dispatch]);

  // פונקציה להגדרת רענון לפני תפוגת טוקן
  const scheduleTokenRefresh = useCallback(() => {
    if (!token || !expirationTime) return;

    // איפוס טיימר קיים
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Date.now();
    const expiryTime = expirationTime * 1000;
    const timeToRefresh = expiryTime - now - AUTH_TIMEOUTS.REFRESH_BEFORE_EXPIRY;

    if (timeToRefresh <= 0) {
      // הטוקן כבר פג או עומד לפוג בקרוב
      dispatch(setNeedsReauth());
      return;
    }

    refreshTimeoutRef.current = setTimeout(() => {
      refreshTokenIfActive();
    }, timeToRefresh);

    console.log(`${AUTH_MESSAGES.REFRESH_SCHEDULED} ${Math.round(timeToRefresh / 60000)} minutes`);
  }, [token, expirationTime, refreshTokenIfActive, dispatch]);

  // ⏰ הגדרת רענון טוקן אוטומטי לפני תפוגה
  useEffect(() => {
    scheduleTokenRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  // 🚨 מעקב אחר פעילות המשתמש
  useEffect(() => {
    if (!token) return;

    // הוספת מאזינים לאירועי פעילות
    USER_ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // איפוס ראשוני של הטיימר
    resetInactivityTimer();

    return () => {
      // ניקוי מאזינים
      USER_ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });

      // ניקוי טיימר
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [token, resetInactivityTimer]);

  // 🟡 רענון ראשוני אם יש persist אבל אין טוקן
  useEffect(() => {
    const persistLogin = localStorage.getItem("persist");

    if (!token && persistLogin && !effectRan.current) {
      effectRan.current = true;

      refresh()
        .unwrap()
        .then(() => {
          console.log(AUTH_MESSAGES.INITIAL_REFRESH_SUCCESS);
        })
        .catch((error) => {
          console.error(AUTH_MESSAGES.INITIAL_REFRESH_FAILED, error);
          // אם הרענון הראשוני נכשל, נוודא שהמשתמש מופנה להתחברות
          dispatch(logout());
        });
    }
  }, [token, refresh, dispatch]);

  // ניקוי כללי בעת unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  const handleLoginRedirect = () => {
    // ניקוי כל הטיימרים לפני יציאה
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    dispatch(logout());
    navigate("/login");
  };

  // בדיקה אם הטוקן פג תוקף (לא רק needsReauth)
  const shouldShowReauth = needsReauth || isExpired;

  let content;
  if (isLoading) {
    content = <div className="fullscreen-cover">טוען נתונים...</div>;
  } else if (shouldShowReauth) {
    content = <SessionExpiredModal handleLoginRedirect={handleLoginRedirect} />;
  } else if (token) {
    content = <Outlet />;
  } else {
    content = <div className="fullscreen-cover">ממתין לאימות...</div>;
  }

  return content;
};

export default PersistsLogin;
