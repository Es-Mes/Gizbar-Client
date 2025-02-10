import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useGetAllCustomersQuery } from "../fetures/customers/customersApiSlice";
import { setCustomersData, setLoading, setError } from "../app/customersSlice";

const useCustomersData = (phone) => {
    const dispatch = useDispatch();
    const { data, isLoading, error } = useGetAllCustomersQuery({ phone });

    useEffect(() => {
        console.log("Fetching customers data:", { data, isLoading, error });
        dispatch(setLoading(isLoading));
        if (data) {
            if (!data.error) {
                dispatch(setCustomersData(data.data));
            } else {
                dispatch(setError(data.message));
            }
        }
        if (error)
            dispatch(setError(error.message));
    }, [data, isLoading, error, dispatch]);

};

export default useCustomersData
