import apiSlice from "../../app/apiSlice";

const servicesApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        // getAllServices: build.query({
        //     query: ({ phone }) => ({
        //         url: `/api/agent/${phone}/service`,
        //     }),
        //     providesTags: ["Services"],
        // }),
        addService: build.mutation({
            query: ({ phone, service }) => ({
                url: `/api/agent/${phone}/service`,
                method: "POST",
                body: service,
            }),
            invalidatesTags: ["Services"],
        }),
        updateService: build.mutation({
            query: ({ phone, _id, service }) => ({
                url: `/api/agent/${phone}/service`,
                method: "PUT",
                body: service,
            }),
            invalidatesTags: ["Services"],
        }),
        deleteService: build.mutation({
            query: ({ phone, _id }) => ({
                url: `/api/agent/${phone}/services/delete/${_id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Services"],
        }),
    }),
});

export const {
    useGetAllServicesQuery,
    useAddServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
} = servicesApiSlice;
