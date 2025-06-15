import apiSlice from "../../app/apiSlice";

const transactionsApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getTransactionById: build.query({
            query: ({ agentPhone, transactionId }) => ({
                url: `/api/agent/${agentPhone}/transactions/${transactionId}`,
            }),
            providesTags: (result, error, { transactionId }) => [
                { type: "Transactions", id: transactionId },
            ],
        }),
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
                url: `/api/agent/${phone}/transactions/update`,
                method: "PUT",
                body: transaction,
            }),
            invalidatesTags: ["Transactions"],
        }),
        deleteTransaction: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/transactions/cancele`,
                method: "put",
                body: { _id },
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
    useGetTransactionByIdQuery,
    useGetAllTransactionsQuery,
    useGetAllTransactionsAsCustomerQuery,
    useAddTransactionMutation,
    useUpdateTransactionMutation,
    useDeleteTransactionMutation,
    usePayInCashMutation,
    useSendReminderMutation
} = transactionsApiSlice;
