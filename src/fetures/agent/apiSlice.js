// app/apiSlice.js
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../../app/customBaseQuery'

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Agent', 'Transactions', 'TransactionsAsCustomers', 'Customers', 'Services'], // הוספת כל התגיות
  endpoints: (builder) => ({
    getAgent: builder.query({
      query: ({ phone }) => `/api/agent/${phone}`,
      providesTags: ['Agent']
    }),
  }),
})

export default apiSlice
export const { useGetAgentQuery, useGetAgentApiPaymentDetailsQuery } = apiSlice
