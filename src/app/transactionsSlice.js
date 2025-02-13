import { createSlice } from "@reduxjs/toolkit";

const transactionsSlice = createSlice({
    name: "transactions",
    initialState: { transactions: [], isLoading: false, error: null },
    reducers: {
        setTransactionsData(state, action) {
            const updatedTransactions = action.payload;
            state.transactions = updatedTransactions;
        },
        addNewTransaction(state, action) {
            const newTransection = action.payload;
            state.transactions.push(newTransection)
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { setTransactionsData, addNewTransaction, setLoading, setError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
