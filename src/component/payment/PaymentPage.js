import { useLocation } from "react-router-dom";
import PaymentIframe from "./PaymentForm";

const PaymentPage = () => {
    const location = useLocation();
    const { amount, customer } = location.state || {};

    return (
        <div>
            <h2>תשלום באשראי</h2>
            {amount && customer ? (
                <PaymentIframe initialCustomerData={{
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
