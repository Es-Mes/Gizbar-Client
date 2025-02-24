import { useLocation } from "react-router-dom";
import PaymentIframe from "./PaymentForm";
import PaymentForm from "./PaymentForm";

const PaymentPage = () => {
    const location = useLocation();
    const { amount, customer } = location.state || {};

    return (
        <div>
            <h2>תשלום באשראי</h2>
            {amount && customer ? (
                <PaymentForm initialCustomerData={{
                    FirstName: customer.full_name,
                    Phone: customer.phone,
                    Mail: customer.email,
                    Amount: amount,
                    Currency: "1"
                }} />
            ) : (
                <p>שגיאה: פרטי העסקה חסרים.</p>
            )}
        </div>
    );
};

export default PaymentPage;
