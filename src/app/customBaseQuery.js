import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setToken, logout, setNeedsReauth } from '../fetures/auth/authSlice'
import { toast } from 'react-toastify'

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
  if (result?.error?.status === 403) {
    const errorMessage = result?.error?.data?.message;

    // רשימת הודעות שגיאה ספציפיות שלא צריכות להפעיל reauth
    const specificErrorMessages = [
      "A customer who has transactions cannot be deleted.",
      // ניתן להוסיף הודעות נוספות כאן בעתיד
    ];

    // בדיקה אם זו שגיאה ספציפית או שגיאת הרשאה כללית
    if (specificErrorMessages.includes(errorMessage)) {
      // שגיאה ספציפית - לא צריך reauth, נטפל במקום
      console.log("Specific 403 error, not triggering reauth:", errorMessage);
    } else {
      // שגיאת הרשאה כללית - צריך טיפול מיוחד
      console.log("General 403 error, showing toast and handling gracefully");

      // הצגת toast עם הודעה ברורה
      toast.error("אין לך הרשאה לבצע פעולה זו", {
        autoClose: 5000,
        position: "top-center"
      });

      // במקום setNeedsReauth, נחזיר לעמוד הראשי או נטפל אחרת
      // api.dispatch(setNeedsReauth()); // נשאיר מוערם לעת עתה
    }
  }

  //   נחלץ את .data אם יש
  result.data = result?.data?.data ?? result.data;

  console.log(result);

  return result
}
