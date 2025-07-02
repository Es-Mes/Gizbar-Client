import { useSelector } from "react-redux";
import { selectToken } from "../fetures/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuthStatus = () => {
  const token = useSelector(selectToken);
  let isExpired = true; // הנחת יסוד: אין טוקן = פג תוקף

  if (token) {
    const decodedToken = jwtDecode(token);
    // 'exp' הוא בשניות, Date.now() במילישניות
    if (decodedToken.exp * 1000 > Date.now()) {
      isExpired = false;
    }
  }

  return { token, isExpired };
};

export default useAuthStatus;