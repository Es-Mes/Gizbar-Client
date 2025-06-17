import apiSlice from "../agent/apiSlice";

const servicesApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        addService: build.mutation({
            query: ({ phone, service }) => ({
                url: `/api/agent/${phone}/service`,
                method: "POST",
                body: service,
            }),
            invalidatesTags: ["Agent"],
        }),
        updateService: build.mutation({
            query: ({ phone, service }) => ({
                url: `/api/agent/${phone}/service`,
                method: "PUT",
                body: service,
            }),
            invalidatesTags: ["Agent"],
        }),
        freezService: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/service/freeze`,
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: { _id },
            }),
            invalidatesTags: ["Agent"],
        }),
        unFreezService: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/service/unfreeze`,
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: { _id },
            }),
            invalidatesTags: ["Agent"],
        }),

        deleteService: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/service`, // הוספת ה-_id ל-URL
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: { _id },
            }),
            invalidatesTags: ["Agent"],
        }),
    }),
});

export const {
    useGetAllServicesQuery,
    useAddServiceMutation,
    useUpdateServiceMutation,
    useFreezServiceMutation,
    useUnFreezServiceMutation,
    useDeleteServiceMutation,
} = servicesApiSlice;
