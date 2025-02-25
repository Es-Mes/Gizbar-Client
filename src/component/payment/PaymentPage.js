import { useLocation } from "react-router-dom";
import PaymentIframe from "./PaymentForm";
import PaymentForm from "./PaymentForm";

const PaymentPage = () => {
    const location = useLocation();
    return (
        <div>
            <h2>תשלום באשראי</h2>
            
                <PaymentForm/>
          
        </div>
    );
};

export default PaymentPage;