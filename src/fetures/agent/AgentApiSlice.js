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
        updateAgent: build.mutation({
            query: (data) => ({
                url: `/api/agent`, // נתיב מתאים לפי השרת שלך
                method: 'PUT',
                body: data,
            }),
            providesTags: ["Agent"],
        }),
        updatePaymentDetails: build.mutation({
            query: (data) => ({
                url: `/api/agent/paymentDetails`, // נתיב מתאים לפי השרת שלך
                method: 'PUT',
                body: data,
            }),
            providesTags: ["Agent"],
        }),

    }),
});

export const {
    useGetAllAgentsQuery,
    useUpdatePaymentDetailsMutation,
    useUpdateAgentMutation
} = agentApiSlice;
