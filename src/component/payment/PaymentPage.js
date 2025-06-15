import { useLocation } from "react-router-dom";
import PaymentIframe from "./PaymentForm";
import PaymentForm from "./PaymentForm";
import { useParams } from "react-router-dom/dist/umd/react-router-dom.development";
import { useGetTransactionByIdQuery } from "../../fetures/transactions/TransactionsApiSlice";
import useAuth from "../../hooks/useAuth";
import { useGetAgentApiPaymentDetailsQuery } from "../../app/apiSlice";

const PaymentPage = () => {
//   const { phone } = useAuth();
  const { agentPhone, transactionId } = useParams();

  const skip = !agentPhone || !transactionId;

  const {
    data: transactionData,
    error: transactionError,
    isLoading: isLoadingTransaction,
  } = useGetTransactionByIdQuery({ agentPhone, transactionId }, { skip });

  //   const { data, error, isLoading } = useGetTransactionByIdQuery(
//     {agentPhone:phone, transactionId:'6784bd9ca0ac8a5f37f1be32' }

//   );
//   console.log(`useGetTransactionByIdQuery: ${console.log(JSON.stringify(data, null, 2))
// }`);

  const agentId = transactionData?.customer?.agent;

  const {
    data: agentData,
    error: agentError,
    isLoading: isLoadingAgent,
  } = useGetAgentApiPaymentDetailsQuery({ agentId }, { skip: !agentId });

  // ✅ שלב 1 - בדיקה כללית
//   if (skip) return <p>פרטי כתובת לא תקינים</p>;

  // ✅ שלב 2 - טעינה
  if (isLoadingTransaction || isLoadingAgent) return <p>טוען...</p>;

  // ✅ שלב 3 - שגיאה
  if (transactionError && agentError) return <p>שגיאה בטעינת נתונים</p>;

  // ✅ שלב 4 - בדיקות סטטוס
  if (transactionData?.status === "paid") return <>העסקה כבר שולמה, תודה!</>;
  if (transactionData?.status === "canceled") return <>העסקה בוטלה!</>;

  // ✅ שלב 5 - הצגת טופס
  const initialCustomerData = {
    FirstName: transactionData?.customer?.full_name,
    Phone: transactionData?.customer?.phone,
    Mail: transactionData?.customer?.email,
    Amount: transactionData?.price,
    Currency: "1",
  };

  return (
    <div style={{margin:'20px'}}>
      <h2>תשלום באשראי</h2>
      <PaymentForm
        initialAgentData={agentData?.data}
        initialCustomerData={initialCustomerData}
      />
    </div>
  );
};


export default PaymentPage;