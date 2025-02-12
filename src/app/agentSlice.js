import { createSlice } from "@reduxjs/toolkit";

const agentSlice = createSlice({
    name: "agent",
    initialState: { data: {}, isLoading: false, error: null },
    reducers: {
        setAgentData(state, action) {
            state.data = action.payload;
        },
        addServiceStore(state, action) {
            state.data.services.push(action.payload); // הוספת שירות חדש
        },
        deleteServiceStore(state, action) {
            state.data.services = state.data.services.filter(
                (service) => service._id !== action.payload
            );
        },
        updateServiceStore(state, action) {
            const updatedServices = action.payload;
            state.data.services = updatedServices;
        },
        toggleServiceFreezeStore(state, action) {
            const serviceId = action.payload;
            const service = state.data.services.find(service => service._id === serviceId);
            if (service) {
                service.active = !service.active; // שינוי מצב הקפאה
            }
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const {
    setAgentData,
    addServiceStore,
    deleteServiceStore,
    updateServiceStore,
    toggleServiceFreezeStore,
    setLoading,
    setError
} = agentSlice.actions;
export default agentSlice.reducer;
