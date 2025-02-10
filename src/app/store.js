import { configureStore } from "@reduxjs/toolkit";
import apiSlice from "./apiSlice";
import authReducer from "../fetures/auth/authSlice"
import agentReducer from "./agentSlice"; // ייבוא ה-agentSlice
import customersReducer from "./customersSlice"
import transactionsReducer from "./transactionsSlice"
import customerTransactionsReducer from "./customerTransactionsSlice"
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    agent: agentReducer, // הוספת ה-agentSlice
    customers: customersReducer,
    transactions: transactionsReducer,
    customerTransactions: customerTransactionsReducer,
  },
  middleware: (defaultMiddleware) => defaultMiddleware().concat(apiSlice.middleware),
  devTools: false
});

export default store;