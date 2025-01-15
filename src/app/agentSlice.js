import { createSlice } from "@reduxjs/toolkit";

const agentSlice = createSlice({
    name: "agent",
    initialState: { data: { transactionsAsProvider: [], customers: [], services: [] }, isLoading: false, error: null },
    reducers: {
        setAgentData(state, action) {
            state.data = action.payload;
        },
        addServiceStore(state, action) {
            state.data.data.services.push(action.payload); // הוספת שירות חדש
        },
        addCustomerStore(state, action) {
            state.data.data.customers.push(action.payload); // הוספת לקוח חדש
        },
        addTransactionStore(state, action) {
            state.data.data.transactionsAsProvider.push(action.payload); // הוספת עסקה  חדשה
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { setAgentData, addServiceStore, addCustomerStore,addTransactionStore, setLoading, setError } = agentSlice.actions;
export default agentSlice.reducer;
