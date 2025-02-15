import { createSlice } from "@reduxjs/toolkit";

const customerTransactionsSlice = createSlice({
    name: "customerTransactions",
    initialState: { transactions: [], isLoading: false, error: null },
    reducers: {
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

export const { setCustomerTransactionsData, setLoading, setError } = customerTransactionsSlice.actions;
export default customerTransactionsSlice.reducer;
