import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useGetAllTransactionsAsCustomerQuery } from "../fetures/transactions/TransactionsApiSlice";
import { setCustomerTransactionsData,setLoading,setError } from "../app/customerTransactionsSlice";

const useCustomerTransactionsData = (phone) => {
    const dispatch = useDispatch();
    const { data, isLoading, error } = useGetAllTransactionsAsCustomerQuery({ phone });

    useEffect(() => {
        console.log("Fetching customer transactions data:", { data, isLoading, error });
        dispatch(setLoading(isLoading));
        if (data) dispatch(setCustomerTransactionsData(data));
        if (error) dispatch(setError(error.message));
    }, [data, isLoading, error, dispatch]);

};

export default useCustomerTransactionsData
