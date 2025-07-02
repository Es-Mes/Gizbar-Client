import { createSlice } from "@reduxjs/toolkit"
import { jwtDecode } from "jwt-decode"; // נוודא שהייבוא קיים

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem('accessToken') || null,
    expirationTime: localStorage.getItem('expirationTime') || null, // נוסיף את זה
    user: null,
    isInitialized: false,
    needsReauth: false,
  }
  ,
  reducers: {
    setToken: (state, action) => {
      const { accessToken } = action.payload
      const decodedToken = jwtDecode(accessToken);
      const expirationTime = decodedToken.exp; // זמן בשניות

      state.token = accessToken;
      state.expirationTime = expirationTime;
      state.isInitialized = true;
      state.needsReauth = false; // נאפס את הדגל הזה בכל קבלת טוקן חדש

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('expirationTime', expirationTime);

      localStorage.setItem('persist', 'true');


    },
    logout: (state, action) => {
      state.token = null
      state.expirationTime = null; // נאפס גם את זמן התפוגה
      state.isInitialized = true
      state.needsReauth = false
      localStorage.removeItem('accessToken');
      localStorage.removeItem('expirationTime');

      localStorage.removeItem('persist');

    },
    setNeedsReauth: (state, action) => {
      state.needsReauth = true;
    },
  }
})
export default authSlice.reducer
export const { setToken, logout, setNeedsReauth } = authSlice.actions
export const selectToken = (state) => state.auth.token