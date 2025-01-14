import { createSlice } from "@reduxjs/toolkit";

const agentSlice = createSlice({
    name: "agent",
    initialState: { data: null, isLoading: false, error: null },
    reducers: {
        setAgentData(state, action) {
            state.data = action.payload;
        },
        addServiceStore(state, action) {
            state.data.services.push(action.payload); // הוספת שירות חדש
        },
        addCustomerStore(state, action) {
            state.data.customers.push(action.payload); // הוספת לקוח חדש
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { setAgentData, addServiceStore, addCustomerStore, setLoading, setError } = agentSlice.actions;
export default agentSlice.reducer;
