import { useLocation } from "react-router-dom";
import PaymentIframe from "./PaymentForm";
import PaymentForm from "./PaymentForm";
import { useParams } from "react-router-dom/dist/umd/react-router-dom.development";

const PaymentPage = () => {
    const { transactionId,phone } = useParams();
    const location = useLocation();

//     const skip = !transactionId;
//   const { data, error, isLoading } = useGetT(transactionId, { skip });

//   if (!skip && isLoading) return <p>טוען...</p>;
//   if (!skip && error) return <p>שגיאה בטעינת נתוני העסקה</p>;

    return (
        <div>
            <h2>תשלום באשראי</h2>
            
                <PaymentForm/>
          
        </div>
    );
};

export default PaymentPage;