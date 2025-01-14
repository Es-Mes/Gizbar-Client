// import {useSelector} from "react-redux"
// import { selectToken } from "../fetures/auth/authSlice"
// import {jwtDecode} from "jwt-decode"

// const useAuth=()=>{
//     const token=useSelector(selectToken)
//     let isAdmin=false
//     let isUser=false
//     if(token){
//         const userDecoded=jwtDecode(token)
//         console.log("userDecoded",userDecoded);
//         const {_id,roles,phone,first_name,last_name,email,address,services,customers,transactionsAsProvider,transactionsAsCustomer,isActive,isDeleted}=userDecoded
//         isAdmin=roles==='admin'
//         isUser=roles==='user'
//         return {_id,roles,phone,first_name,last_name,email,address,services,customers,transactionsAsProvider,transactionsAsCustomer,isActive,isDeleted,isAdmin,isUser}
//     }
//     return {_id:"",userName:'',isAdmin,isUser,name:"",email:"",roles:""}
// }
// export default useAuth

import { useSelector } from "react-redux";
import { selectToken } from "../fetures/auth/authSlice";
import {jwtDecode} from "jwt-decode";

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
            email: decoded.email || "",
            isAdmin: decoded.roles === "admin",
            isUser: decoded.roles === "user",
        };
    }
    return { _id: "", roles: "", phone: "", first_name: "", last_name: "", email: "", isAdmin: false, isUser: false };
};

export default useAuth;
