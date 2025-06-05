import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import { useSelector, useDispatch } from "react-redux";
import { selectToken } from "./authSlice";

const PersistsLogin = () => {
  const token = useSelector(selectToken);
  const needsReauth = useSelector((state) => state.auth.needsReauth);
  const [trueSuccess, setTrueSuccess] = useState(false);
  const effectRan = useRef(false);
  const navigate = useNavigate();

  const [refresh, {
    isUninitialized,
    isLoading,
    isSuccess,
    isError,
    error
  }] = useRefreshMutation();

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

  // 💡 תעדוף: טוען → שגיאה (אם אין הצלחה) → תוכן תקין → כלום
  if (isLoading) {
    return <h1>טוען נתונים...</h1>;
  }

  const shouldShowError =
    (isError || needsReauth) &&
    !(isSuccess && trueSuccess) &&
    !(token && isUninitialized);

  if (shouldShowError) {
    return (
      <div>
        <h6 className="errorMsg">תוקף החיבור פג. אנא התחבר מחדש.</h6>
        <button onClick={() => navigate("/login")}>
          חזור לדף ההתחברות
        </button>
      </div>
    );
  }

  if ((isSuccess && trueSuccess) || (token && isUninitialized)) {
    return <Outlet />;
  }

  // במקרה שאין עדיין מידע, לא להציג כלום
  return null;
};

export default PersistsLogin;
