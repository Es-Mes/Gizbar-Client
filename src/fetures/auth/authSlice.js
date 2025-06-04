import {createSlice} from "@reduxjs/toolkit"

const authSlice=createSlice({
    name:"auth",
    initialState:{token: localStorage.getItem('accessToken') || null,  isInitialized: false,needsReauth:false
},
    reducers:{
        setToken:(state,action)=>{
            const {accessToken}=action.payload
            state.token=accessToken
            localStorage.setItem('accessToken', action.payload.accessToken)
            state.isInitialized = true

        },
        logout:(state,action)=>{
            state.token=null
              localStorage.removeItem('accessToken')
                state.isInitialized = true

        },
        setNeedsReauth: (state, action) => {
      state.needsReauth = true;
    },
    }
})
export default authSlice.reducer
export const {setToken,logout,setNeedsReauth}=authSlice.actions
export const selectToken=(state)=>state.auth.token