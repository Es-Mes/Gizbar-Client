import { createSlice } from "@reduxjs/toolkit";

const agentSlice = createSlice({
    name: "agent",
    initialState: { agent: {}, isLoading: false, error: null },
    reducers: {
        setAgentData(state, action) {
            state.agent = action.payload;
        },
        addServiceStore(state, action) {
            state.agent.services.push(action.payload); // הוספת שירות חדש
        },
        deleteServiceStore(state, action) {
            state.agent.services = state.agent.services.filter(
                (service) => service._id !== action.payload
            );
        },
        updateServiceStore(state, action) {
            const updatedServices = action.payload;
            state.agent.services = updatedServices;
        },
        toggleServiceFreezeStore(state, action) {
            const serviceId = action.payload;
            const service = state.agent.services.find(service => service._id === serviceId);
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
