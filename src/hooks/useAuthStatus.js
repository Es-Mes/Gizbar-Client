import { useSelector } from "react-redux";
import { selectToken, selectExpirationTime } from "../fetures/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuthStatus = () => {
  const token = useSelector(selectToken);
  const expirationTime = useSelector(selectExpirationTime);

  let isExpired = true;
  let timeToExpiry = 0;

  if (token && expirationTime) {
    const now = Date.now();
    const expiryMs = expirationTime * 1000;
    timeToExpiry = expiryMs - now;

    // הטוקן תקף אם עוד לא פג תוקפו
    isExpired = timeToExpiry <= 0;
  } else if (token) {
    // אם יש טוקן אבל אין expirationTime, ננסה לחלץ מהטוקן
    try {
      const decodedToken = jwtDecode(token);
      const now = Date.now();
      const expiryMs = decodedToken.exp * 1000;
      timeToExpiry = expiryMs - now;
      isExpired = timeToExpiry <= 0;
    } catch (error) {
      console.error('Failed to decode token in useAuthStatus:', error);
      isExpired = true;
      timeToExpiry = 0;
    }
  }

  return {
    token,
    isExpired,
    timeToExpiry: Math.max(0, timeToExpiry),
    expirationTime
  };
};

export default useAuthStatus;