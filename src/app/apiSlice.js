import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:50901",
        // baseUrl:"https://gizbar.onrender.com",
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getAgent: builder.query({
            query: ({ phone }) => `/api/agent/${phone}`,
        }),
    }),
});

export const { useGetAgentQuery } = apiSlice;
export default apiSlice;
