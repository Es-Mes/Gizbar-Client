import { createSlice } from "@reduxjs/toolkit";

const customerTransactionsSlice = createSlice({
    name: "customerTransactions",
    initialState: { transactions: [], isLoading: false, error: null },
    reducers: {
        getCustomerTransactionsData(state, action) {
            state.transactions = action.payload;
        },
        setCustomerTransactionsData(state, action) {
            const updatedTransactions = action.payload;
            state.transactions = updatedTransactions;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { getCustomerTransactionsData, setCustomerTransactionsData, setLoading, setError } = customerTransactionsSlice.actions;
export default customerTransactionsSlice.reducer;
