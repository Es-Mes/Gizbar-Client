import apiSlice from "../../app/apiSlice";

const customersApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAllCustomers: build.query({
            query: ({ phone }) => ({
                url: `/api/agent/${phone}/customers`,
            }),
            providesTags: ["Customers"],
        }),
        addCustomer: build.mutation({
            query: ({ phone, customer }) => ({
                url: `/api/agent/${phone}/customers/add`,
                method: "POST",
                body: customer,
            }),
            invalidatesTags: ["Customers"],
        }),
        updateCustomer: build.mutation({
            query: ({ phone, customer }) => ({
                url: `/api/agent/${phone}/customers`,
                // url: `/api/agent/${phone}/customers/update/${customer._id}`,
                method: "PUT",
                body: customer,
            }),
            invalidatesTags: ["Customers"],
        }),
        deleteCustomer: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/customers`,
                // url: `/api/agent/${phone}/customers/delete/${_id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Customers"],
        }),
    }),
});

export const {
    useGetAllCustomersQuery,
    useAddCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} = customersApiSlice;
