import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setToken, logout,setNeedsReauth } from '../fetures/auth/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 401) {
    // רענון הטוקן
    const refreshResult = await baseQuery(`${process.env.REACT_APP_BASE_URL}/api/auth/refresh`, api, extraOptions)
    if (refreshResult?.data?.accessToken) {
      api.dispatch(setToken({ accessToken: refreshResult.data.accessToken }))
      // מנסה מחדש את הבקשה המקורית
      result = await baseQuery(args, api, extraOptions)
    } else {
       api.dispatch(setNeedsReauth());
    }
  }
  if(result?.error?.status === 403){
     api.dispatch(setNeedsReauth());
  }
  
//   נחלץ את .data אם יש
  result.data = result?.data?.data ?? result.data;

  console.log(result);
  
  return result
}
