import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useGetUserQuery } from "../fetures/users/UsersApiSlice";
import { setAgentData,setLoading,setError } from "../app/agentSlice";

const useAgentData = (phone) => {
    const dispatch = useDispatch();
    const { data, isLoading, error } = useGetUserQuery({ phone });

    useEffect(() => {
        console.log("Fetching agent data:", { data, isLoading, error });
        dispatch(setLoading(isLoading));
        if (data) dispatch(setAgentData(data));
        if (error) dispatch(setError(error.message));
    }, [data, isLoading, error, dispatch]);
};

export default useAgentData
