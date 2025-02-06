import { createSlice } from "@reduxjs/toolkit";

const transactionsSlice = createSlice({
    name: "transactions",
    initialState: { data: { transactions: [] }, isLoading: false, error: null },
    reducers: {
        getTransactionsData(state, action) {
            state.data = action.payload;
        },
        setTransactionsData(state, action) {
            const updatedTransactions = action.payload;
            state.data.transactions = updatedTransactions;
        },
        addNewTransaction(state, action) {
            const newTransection = action.payload;
            state.data.transactions.push(newTransection)
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { getTransactionsData, setTransactionsData, addNewTransaction, setLoading, setError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
