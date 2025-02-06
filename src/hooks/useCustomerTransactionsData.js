import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useGetAllTransactionsAsCustomerQuery } from "../fetures/transactions/TransactionsApiSlice";
import { setCustomerTransactionsData, setLoading, setError } from "../app/customerTransactionsSlice";

const useCustomerTransactionsData = (phone) => {
    const dispatch = useDispatch();
    const { data, isLoading, error } = useGetAllTransactionsAsCustomerQuery({ phone });

    useEffect(() => {
        console.log("Fetching customer transactions data:", { data, isLoading, error });
        dispatch(setLoading(isLoading));
        if (data)
            if (data) {
                console.log(data);

                if (!data.error) {
                    dispatch(setCustomerTransactionsData(data.data));
                } else {
                    dispatch(setError(data.message));
                }
            }

        if (error) dispatch(setError(error.message));
    }, [data, isLoading, error, dispatch]);

};

export default useCustomerTransactionsData
