import { useSelector } from "react-redux";
import { selectToken } from "../fetures/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
    const token = useSelector(selectToken);
    if (token) {
        const decoded = jwtDecode(token);
        return {
            _id: decoded._id || "",
            roles: decoded.roles || "",
            phone: decoded.phone || "",
            first_name: decoded.first_name || "",
            last_name: decoded.last_name || "",
            isAdmin: decoded.roles === "admin",
            isUser: decoded.roles === "user",
            paymentType: decoded.paymentType || "none",
        };
    }
    return { _id: "", roles: "", phone: "", isAdmin: false, isUser: false,paymentType:"none" };
};

export default useAuth;
