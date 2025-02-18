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
        setTransactionPaid(state,action){
            const paidTransaction = action.payload;
            const updatedTransactions = state.transactions.map((transaction) => {
                if(transaction._id === paidTransaction._id){
                    return {...transaction,status:"paid",
                    paymentDate : new Date(),
                    paymentType : "cash"}
                }
            })
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

export const { setTransactionsData, addNewTransaction,setTransactionPaid, setLoading, setError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
