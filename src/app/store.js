import { configureStore } from "@reduxjs/toolkit";
import apiSlice from "./apiSlice";
import authReducer from "../fetures/auth/authSlice"
import productsSlice from "../fetures/products/productsSlice";
import agentReducer from "./agentSlice"; // ייבוא ה-agentSlice

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]:apiSlice.reducer,
    auth:authReducer,
    products:productsSlice,
    agent: agentReducer, // הוספת ה-agentSlice
  },
  middleware:(defaultMiddleware)=>defaultMiddleware().concat(apiSlice.middleware),
  devTools:false
});

export default store;