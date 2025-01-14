import apiSlice from "../../app/apiSlice"

const usersApiSlice=apiSlice.injectEndpoints({
    endpoints:(build)=>({
        getAllUsers:build.query({
            query:()=>({
                url:"/api/agent"
            }),
            providesTags:["Users"]
        }),
        getUser:build.query({
            query:({phone})=>({
                url:`/api/agent/${phone}`
            }),
            providesTags:["Users"]
        }),
        updateUser:build.mutation({
            query:(user)=>({
                url:"/api/agent",
                method:"PUT",
                body:user
            }),
            invalidatesTags:["Users"]
        }),
        deleteUser:build.mutation({
            query:({_id})=>({
                url:"/api/agent",
                method:"Delete",
                body:{_id}
            }),
            invalidatesTags:["Users"]
        })
    })
})

export const{useGetAllUsersQuery,useGetUserQuery,useAddUserMutation,useUpdateUserMutation,useDeleteUserMutation}=usersApiSlice