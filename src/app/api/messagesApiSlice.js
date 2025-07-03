// features/messages/messagesApiSlice.js
import  apiSlice  from "../../fetures/agent/apiSlice";

export const messagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    sendCustomMessage: build.mutation({
      query: (body) => ({
        url: "/api/agent/message",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const { useSendCustomMessageMutation } = messagesApiSlice;
