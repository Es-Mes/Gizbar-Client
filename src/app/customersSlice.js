import { createSlice } from "@reduxjs/toolkit";

const customersSlice = createSlice({
    name: "customers",
    initialState: { customers: [], isLoading: false, error: null },
    reducers: {
        setCustomersData(state, action) {
            state.customers = action.payload;
        },
        addNewCustomer(state, action) {
            const newCustomer = action.payload;
            state.customers.push(newCustomer)
        },
        updateCustomerData(state, action) {
            const updatedCustomer = action.payload;
            state.customers = state.customers.map(customer => {
                if (customer._id === updatedCustomer._id) {
                    return updatedCustomer;
                } else {
                    return customer
                }
            })
        },
        deleteCustomerData(state, action) {
            const deletedCustomerId = action.payload;
            state.customers = state.customers.filter(
                customer => customer._id !== deletedCustomerId
            );
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { setCustomersData, addNewCustomer, updateCustomerData, deleteCustomerData, setLoading, setError } = customersSlice.actions;
export default customersSlice.reducer;
