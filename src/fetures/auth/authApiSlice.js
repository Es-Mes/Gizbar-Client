import apiSlice from "../../app/apiSlice"
import { logout, setToken } from "./authSlice";

const authApiSlice=apiSlice.injectEndpoints({
    endpoints:(build)=>({
        login:build.mutation({
            query:(userData)=>({
                url:"/api/auth/login",
                method:"post",
                body:userData
            }),
            async onQueryStarted(arg,{dispatch,queryFulfilled }){
                try{
                    const {data}=await queryFulfilled
                    console.log(data);
                    if(data.accessToken){
                        dispatch(setToken({accessToken:data.accessToken}))
                    }
                }catch(err){
                    console.log(err);
                }
            },
        }),
        regist:build.mutation({
            query:(userData)=>({
                url:"/api/auth/register",
                method:"POST",
                body:userData
            }),
            async onQueryStarted(arg,{dispatch,queryFulfilled }){
                try{
                    const {data}=await queryFulfilled
                    console.log(data);
                    if(data.accessToken){
                        dispatch(setToken({accessToken:data.accessToken}))
                    }
                }catch(err){
                    console.log(err);
                }
            },
        }),
        sendLogout:build.mutation({
            query:()=>({
                url:"/api/auth/logout",
                method:"POST"
            }),
            async onQueryStarted(arg,{dispatch,queryFulfilled }){
                try{
                    //const {data}=
                    await queryFulfilled
                    //console.log(data);
                    dispatch(logout())
                    setTimeout(()=>{
                        dispatch(apiSlice.util.resetApiState())
                    },1000)
                }catch(err){
                    console.log(err);
                }
            },
        }),
        refresh:build.mutation({
            query:()=>({
                url:"/api/auth/refresh",
                method:"POST",
                credentials: 'include', // זה החלק החשוב!
            }),
            async onQueryStarted(arg,{dispatch,queryFulfilled }){
                try{
                    const {data}=await queryFulfilled
                    console.log(data);
                    if(data.accessToken){
                        dispatch(setToken({accessToken:data.accessToken}))
                    }
                }catch(err){
                    console.log(err);
                }
            },
        }),
        forgotPassword:build.mutation({
            query:({phone})=>({
                url:"/api/auth/forgotPassword",
                method:"POST",
                credentials: 'include', // זה החלק החשוב!
                body:{phone}
            }),
        }),
        changePassword:build.mutation({
            query:({phone,newPassword, oldPassword, code})=>({
                url:"/api/auth/changePassword",
                method:"PUT",
                credentials: 'include', // זה החלק החשוב!
                body:{phone, newPassword, oldPassword, code}
            }),
        }),
        changePasswordWithTWT:build.mutation({
            query:({phone,newPassword, oldPassword, code})=>({
                url:`/api/agent/${phone}/changePassword`,
                method:"PUT",
                credentials: 'include', // זה החלק החשוב!
                body:{phone, newPassword, oldPassword, code}
            }),
        }),

    })
})

export const {useLoginMutation,useRegistMutation,useSendLogoutMutation,useRefreshMutation,useChangePasswordMutation,useForgotPasswordMutation,useChangePasswordWithTWTMutation}=authApiSlice
