// app/apiSlice.js
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './customBaseQuery'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAgent: builder.query({
      query: ({ phone }) => `/api/agent/${phone}`,
      providesTags: ['Agent']

    }),
    getAgentApiPaymentDetails: builder.query({
            query: ({ agentId }) => ({
                url: `/api/agent/${agentId}`,
            }),
            providesTags:  ['Agent'],
        }),
  }),
})

export default apiSlice
export const { useGetAgentQuery,useGetAgentApiPaymentDetailsQuery } = apiSlice
