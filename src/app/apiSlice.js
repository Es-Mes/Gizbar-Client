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
  }),
})

export default apiSlice
export const { useGetAgentQuery } = apiSlice
