import { useLocation } from "react-router-dom";
import PaymentIframe from "./PaymentForm";
import { useParams } from "react-router-dom/dist/umd/react-router-dom.development";
import { useGetTransactionByIdQuery } from "../../fetures/transactions/TransactionsApiSlice";
import useAuth from "../../hooks/useAuth";
import { useGetAgentApiPaymentDetailsQuery, useGetAgentQuery } from "../../fetures/agent/apiSlice";
import SaveCardForm from "./SaveCardForm";

const PaymentDedails = () => {
  const { phone } = useAuth();
  const {data : agent,isLoading,isError,error} = useGetAgentQuery({phone})


  // ✅ שלב 2 - טעינה
  if (isLoading) return <p>טוען...</p>;

  // ✅ שלב 3 - שגיאה
  if (isError) return <p>שגיאה בטעינת נתונים</p>;

 
  // ✅ שלב 5 - הצגת טופס
  const initialCustomerData = {
    FirstName: agent?.first_name,
    LastName: agent?.last_name,
    Phone: agent?.phone,
    Mail: agent?.email,
  };


  return (
    <div style={{ margin: '20px' }}>
      <form>
        <h2>קוד מוסד ו ApiValid מנדרים פלוס</h2>
        <h2>פרטי בנק להעברת התשלום</h2>
      </form>
      <div className="credit-swipe">💳</div>
      <SaveCardForm
        initialCustomerData={initialCustomerData}
      />
    </div>
  );
};


export default PaymentDedails;