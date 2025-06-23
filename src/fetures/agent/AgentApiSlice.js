import apiSlice from "./apiSlice";

const agentApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAllAgents: build.query({
            query: () => ({
                url: "/api/agent",
                method: "GET",
            }),
            providesTags: ["Agent"],
        }),
        addPaymentDetails: build.mutation({
            query: ({ phone, agent }) => ({
                url: `/api/agent/${phone}/paymentDetails/add`,
                method: "POST",
                body: agent,
            }),
            providesTags: ["Agent"],
        }),
        updateAgent: build.mutation({
            query: (data) => ({
                url: `/api/agent/update`, // נתיב מתאים לפי השרת שלך
                method: 'PUT',
                body: data,
            }),
            providesTags: ["Agent"],
        }),

    }),
});

export const {
    useGetAllAgentsQuery,
    useAddPaymentDetailsMutation,
    useUpdateAgentMutation
} = agentApiSlice;
