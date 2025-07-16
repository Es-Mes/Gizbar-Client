import { createSlice } from "@reduxjs/toolkit"
import { jwtDecode } from "jwt-decode";
import { LOCAL_STORAGE_KEYS, AUTH_MESSAGES } from "./authConstants";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN) || null,
    expirationTime: localStorage.getItem(LOCAL_STORAGE_KEYS.EXPIRATION_TIME) ?
      parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.EXPIRATION_TIME)) : null,
    user: null,
    isInitialized: false,
    needsReauth: false,
  },
  reducers: {
    setToken: (state, action) => {
      const { accessToken } = action.payload;

      try {
        const decodedToken = jwtDecode(accessToken);
        const expirationTime = decodedToken.exp; // זמן בשניות

        state.token = accessToken;
        state.expirationTime = expirationTime;
        state.isInitialized = true;
        state.needsReauth = false;

        // שמירה ב-localStorage
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.EXPIRATION_TIME, expirationTime.toString());
        localStorage.setItem(LOCAL_STORAGE_KEYS.PERSIST, 'true');

        console.log(`${AUTH_MESSAGES.TOKEN_SET}: ${new Date(expirationTime * 1000).toLocaleString()}`);
      } catch (error) {
        console.error('Failed to decode token:', error);
        // אם הטוקן לא תקין, נאפס הכל
        state.token = null;
        state.expirationTime = null;
        state.needsReauth = true;
      }
    },

    logout: (state, action) => {
      state.token = null;
      state.expirationTime = null;
      state.isInitialized = true;
      state.needsReauth = false;

      // ניקוי localStorage
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.EXPIRATION_TIME);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PERSIST);

      console.log(AUTH_MESSAGES.USER_LOGGED_OUT);
    },

    setNeedsReauth: (state, action) => {
      state.needsReauth = true;
      console.log(AUTH_MESSAGES.REAUTH_REQUIRED);
    },

    clearNeedsReauth: (state, action) => {
      state.needsReauth = false;
    }
  }
});

export default authSlice.reducer;
export const { setToken, logout, setNeedsReauth, clearNeedsReauth } = authSlice.actions;
export const selectToken = (state) => state.auth.token;
export const selectExpirationTime = (state) => state.auth.expirationTime;
export const selectNeedsReauth = (state) => state.auth.needsReauth;