import apiSlice from "../../app/apiSlice";

const transactionsApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAllTransactions: build.query({
            query: ({ phone }) => ({
                url: `/${phone}/transactions`,
            }),
            providesTags: ["Transactions"],
        }),
        addTransaction: build.mutation({
            query: ({ phone, transaction }) => ({
                url: `/${phone}/transactions/add`,
                method: "POST",
                body: transaction,
            }),
            invalidatesTags: ["Transactions"],
        }),
        updateTransaction: build.mutation({
            query: ({ phone, transaction }) => ({
                url: `/${phone}/transactions/update/${transaction._id}`,
                method: "PUT",
                body: transaction,
            }),
            invalidatesTags: ["Transactions"],
        }),
        deleteTransaction: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/${phone}/transactions/delete/${_id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Transactions"],
        }),
    }),
});

export const {
    useGetAllTransactionsQuery,
    useAddTransactionMutation,
    useUpdateTransactionMutation,
    useDeleteTransactionMutation,
} = transactionsApiSlice;
