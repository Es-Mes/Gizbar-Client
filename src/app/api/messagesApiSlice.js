// features/messages/messagesApiSlice.js
import apiSlice from "../../fetures/agent/apiSlice";

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

    // שליחת הודעות לסוכנים (אם נדרש endpoint נפרד)
    sendMessageToAgents: build.mutation({
      query: (body) => ({
        url: "/api/admin/message/agents",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const { useSendCustomMessageMutation, useSendMessageToAgentsMutation } = messagesApiSlice;
