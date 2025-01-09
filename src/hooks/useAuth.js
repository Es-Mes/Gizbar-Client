import {useSelector} from "react-redux"
import { selectToken } from "../fetures/auth/authSlice"
import {jwtDecode} from "jwt-decode"

const useAuth=()=>{
    const token=useSelector(selectToken)
    let isAdmin=false
    let isUser=false
    if(token){
        const userDecoded=jwtDecode(token)
        console.log("userDecoded",userDecoded);
        const {_id,roles,phone,first_name,last_name,email,address,services,customers,transactionsAsProvider,transactionsAsCustomer,isActive,isDeleted}=userDecoded
        isAdmin=roles==='admin'
        isUser=roles==='user'
        return {_id,roles,phone,first_name,last_name,email,address,services,customers,transactionsAsProvider,transactionsAsCustomer,isActive,isDeleted,isAdmin,isUser}
    }
    return {_id:"",userName:'',isAdmin,isUser,name:"",email:"",roles:""}
}
export default useAuth