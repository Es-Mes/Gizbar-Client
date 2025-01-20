import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import dotenv from 'dotenv';
dotenv.config();

const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl:process.env.BASE_URL,
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
