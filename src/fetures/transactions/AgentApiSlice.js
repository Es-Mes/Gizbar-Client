import apiSlice from "../../app/apiSlice";

const agentApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        addPaymentDetails: build.mutation({
            query: ({ phone,agent }) => ({
                url: `/api/agent/${phone}/paymentDetails/add`,
                method:"POST",
                body:agent,
            }),
            providesTags: ["Agent"],
        }),
    }),
});

export const {
    useAddPaymentDetailsMutation,
  
} = agentApiSlice;
