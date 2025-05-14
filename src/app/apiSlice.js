import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setToken } from "../fetures/auth/authSlice";
const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl:process.env.REACT_APP_BASE_URL,
        credentials: "include",
        prepareHeaders: async (headers, { getState,endpoint ,dispatch }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            // אם יש בעיה עם ה־accessToken (למשל, פג תוקף), ננסה לרענן אותו
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include', // חשוב שיתווסף כאן, כדי לשלוח את ה־cookie עם ה־refreshToken
            });
            if (response.ok) {
                const data = await response.json();
                if (data.accessToken) {
                    // אם התקבל accessToken חדש, שמור אותו ב־state
                    dispatch(setToken({ accessToken: data.accessToken }));
                    headers.set("authorization", `Bearer ${data.accessToken}`);
                }
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
