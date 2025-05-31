import apiSlice from "../../app/apiSlice";

const transactionsApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAllTransactions: build.query({
            query: ({ phone }) => ({
                url: `/api/agent/${phone}/transactions`,
            }),
            providesTags: ["Transactions"],
        }),
        getAllTransactionsAsCustomer: build.query({
            query: ({ phone }) => ({
                url: `/api/agent/${phone}/transactionsAsCustomer`
            }),
            providesTags: ["TransactionsAsCustomers"],
        }),
        addTransaction: build.mutation({
            query: ({ phone, transaction }) => ({
                url: `/api/agent/${phone}/transactions/add`,
                method: "POST",
                body: transaction,
            }),
            invalidatesTags: ["Transactions"],
        }),
        updateTransaction: build.mutation({
            query: ({ phone, transaction }) => ({
                url: `/api/agent/${phone}/transactions/update/${transaction._id}`,
                method: "PUT",
                body: transaction,
            }),
            invalidatesTags: ["Transactions"],
        }),
        deleteTransaction: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/transactions/delete/${_id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Transactions"],
        }),
        payInCash: build.mutation({
            query: ({ _id }) => ({
                url: `/api/agent/transaction/payCash`,
                method: "PUT",
                body: { _id },
            }),
            invalidatesTags: ["Transactions"],
        }),
        sendReminder: build.mutation({
            query: ({ type, _id }) => ({
                url: `/api/agent/transaction/sendReminder/${type}`,
                method: "POST",
                body: { _id }
            }),
            invalidatesTags: ["Transactions"],
        }),
    }),
});

export const {
    useGetAllTransactionsQuery,
    useGetAllTransactionsAsCustomerQuery,
    useAddTransactionMutation,
    useUpdateTransactionMutation,
    useDeleteTransactionMutation,
    usePayInCashMutation,
    useSendReminderMutation
} = transactionsApiSlice;
