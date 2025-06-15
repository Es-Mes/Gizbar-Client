import apiSlice from "../../app/apiSlice";

const customersApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        // getAllCustomers: build.query({
        //     query: ({ phone }) => ({
        //         url: `/api/agent/${phone}/customers`,
        //     }),
        //     providesTags: ["Customers"],
        // }),
        getCustomer: build.query({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/customers/${_id}`,
            }),
            providesTags: ["Customers"],
        }),
        addCustomer: build.mutation({
            query: ({ phone, customer }) => ({
                url: `/api/agent/${phone}/customers/add`,
                method: "POST",
                body: customer,
            }),
            invalidatesTags: ["Agent"],
        }),
        updateCustomer: build.mutation({
            query: ({ phone, customer }) => ({
                url: `/api/agent/${phone}/customers`,
                method: "PUT",
                body: customer,
            }),
            invalidatesTags: ["Agent"],
        }),
        deleteCustomer: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/customers/${_id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Agent"],
        }),
    }),
});

export const {
    useGetAllCustomersQuery,
    useGetCustomerQuery,
    useAddCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} = customersApiSlice;
