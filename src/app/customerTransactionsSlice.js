import { createSlice } from "@reduxjs/toolkit";

const customerTransactionsSlice = createSlice({
    name: "customerTransactions",
    initialState: { data: { transactions: [] }, isLoading: false, error: null },
    reducers: {
        getCustomerTransactionsData(state, action) {
            state.data = action.payload;
        },
        setCustomerTransactionsData(state, action) {
            const updatedTransactions = action.payload;
            state.data.transactions = updatedTransactions;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { getCustomerTransactionsData,setCustomerTransactionsData, setLoading, setError } = customerTransactionsSlice.actions;
export default customerTransactionsSlice.reducer;
