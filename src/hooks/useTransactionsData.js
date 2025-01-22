import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useGetAllTransactionsQuery } from "../fetures/transactions/TransactionsApiSlice";
import { setTransactionsData,setLoading,setError } from "../app/transactionsSlice";

const useTransactionsData = (phone) => {
    const dispatch = useDispatch();
    const { data, isLoading, error } = useGetAllTransactionsQuery({ phone });

    useEffect(() => {
        console.log("Fetching transactions data:", { data, isLoading, error });
        dispatch(setLoading(isLoading));
        if (data) dispatch(setTransactionsData(data));
        if (error) dispatch(setError(error.message));
    }, [data, isLoading, error, dispatch]);

};

export default useTransactionsData
