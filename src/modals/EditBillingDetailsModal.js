import { useState } from "react";
import { TextField, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useUpdatePaymentDetailsMutation } from "../fetures/agent/AgentApiSlice";
import { toast } from "react-toastify";

const EditBillingDetailsModal = ({ agent, onClose, onSuccess }) => {
    const [updatePaymentDetails, { isLoading }] = useUpdatePaymentDetailsMutation();
    const [step, setStep] = useState("choose");
    const [error, setError] = useState("");
    const [mosadCode, setMosadCode] = useState(agent?.mosadCode || "");
    const [apiValid, setApiValid] = useState(agent?.apiValid || "");
    const [confirmGizbar, setConfirmGizbar] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        accountName: agent?.bankDetails?.accountName || "",
        accountNumber: agent?.bankDetails?.accountNumber || "",
        bankNumber: agent?.bankDetails?.bankNumber || "",
        branchNumber: agent?.bankDetails?.branchNumber || "",
    });

    const banks = [
        { name: 'בנק הפועלים', number: '12' },
        { name: 'בנק לאומי', number: '10' },
        { name: 'בנק דיסקונט', number: '11' },
        { name: 'הבנק הבינלאומי', number: '31' },
        { name: 'בנק מזרחי טפחות', number: '20' },
        { name: 'פאג"י (בנק פועלי אגודת ישראל)', number: '52' },
        { name: 'בנק ירושלים', number: '54' },
        { name: 'בנק אגוד', number: '13' },
        { name: 'בנק מסד', number: '46' },
        { name: 'בנק יהב', number: '52' },
        { name: 'דואר ישראל', number: '09' },
    ];

    const handleChoose = (option) => {
        setStep(option);
        setError("");
    };

    const handleSubmit = async () => {
        try {
            let payload;

            if (step === "nedarim" && mosadCode && apiValid) {
                payload = {
                    _id: agent?._id,
                    paymentType: "nedarim",
                    mosadCode,
                    apiValid,
                };
            } else if (step === "gizbar" && confirmGizbar) {
                payload = {
                    _id: agent?._id,
                    paymentType: "gizbar",
                    bankDetails,
                };
            } else if (step === "none") {
                payload = {
                    _id: agent?._id,
                    paymentType: "none",
                };
            } else {
                setError("אנא מלא את כל השדות הדרושים");
                return;
            }

            const response = await updatePaymentDetails(payload).unwrap();
            toast.success("פרטי גביה עודכנו בהצלחה!");
            onSuccess && onSuccess();
            onClose();

        } catch (err) {
            console.error(err);
            const errorMessage = err?.data?.message || "שגיאה בעדכון פרטי גביה";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleBack = () => {
        setStep("choose");
        setError("");
    };

    return (
        <div className="edit-billing-modal">
            <h3>עריכת פרטי גביה</h3>

            {step === "choose" && (
                <div className="billing-options">
                    <h4>באיזו דרך תרצה לגבות מהלקוח?</h4>
                    <div className="options-buttons">
                        <button
                            className="option-btn"
                            onClick={() => handleChoose("nedarim")}
                        >
                            יש לי חשבון סליקה בנדרים פלוס
                        </button>
                        <button
                            className="option-btn"
                            onClick={() => handleChoose("gizbar")}
                        >
                            אני רוצה להשתמש בסליקה דרך המערכת
                        </button>
                        <button
                            className="option-btn"
                            onClick={() => handleChoose("none")}
                        >
                            אני לא מעוניין לגבות באשראי בינתיים
                        </button>
                    </div>
                </div>
            )}

            {step === "nedarim" && (
                <div className="nedarim-form">
                    <h4>הכנס פרטי חשבון נדרים פלוס:</h4>
                    <div className="form-fields">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="קוד מוסד"
                            value={mosadCode}
                            onChange={(e) => setMosadCode(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="ApiValid"
                            value={apiValid}
                            onChange={(e) => setApiValid(e.target.value)}
                            margin="normal"
                        />
                    </div>
                    <div className="modal-actions">
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!mosadCode || !apiValid || isLoading}
                        >
                            {isLoading ? 'שומר...' : 'שמור'}
                        </Button>
                        <Button variant="outlined" onClick={handleBack}>
                            חזור
                        </Button>
                    </div>
                </div>
            )}

            {step === "gizbar" && (
                <div className="gizbar-form">
                    <div className="confirmation-box">
                        <p>
                            אני מאשר שכל גביה באשראי תעבור דרך המערכת ואני אקבל את כל ההכנסות עד ל־10 בחודש הבא.
                            <br />
                            פירוט העסקאות וקבלות יופיע באזור האישי.
                        </p>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={confirmGizbar}
                                onChange={() => setConfirmGizbar(!confirmGizbar)}
                            />
                            אני מאשר
                        </label>
                    </div>

                    <h4>פרטי חשבון בנק להעברה:</h4>
                    <div className="form-fields">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="שם בעל החשבון"
                            value={bankDetails.accountName}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="מספר חשבון"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="מספר סניף"
                            value={bankDetails.branchNumber}
                            onChange={(e) => setBankDetails({ ...bankDetails, branchNumber: e.target.value })}
                            margin="normal"
                        />
                        <FormControl fullWidth variant="outlined" margin="normal">
                            <InputLabel>בנק</InputLabel>
                            <Select
                                value={bankDetails.bankNumber}
                                label="בנק"
                                onChange={(e) => setBankDetails({ ...bankDetails, bankNumber: e.target.value })}
                            >
                                {banks.map((bank) => (
                                    <MenuItem key={bank.number} value={bank.number}>
                                        {bank.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <div className="modal-actions">
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={
                                !confirmGizbar ||
                                !bankDetails.accountName ||
                                !bankDetails.accountNumber ||
                                !bankDetails.bankNumber ||
                                !bankDetails.branchNumber ||
                                isLoading
                            }
                        >
                            {isLoading ? 'שומר...' : 'שמור'}
                        </Button>
                        <Button variant="outlined" onClick={handleBack}>
                            חזור
                        </Button>
                    </div>
                </div>
            )}

            {step === "none" && (
                <div className="none-option">
                    <p>בסדר גמור, תמיד אפשר לשנות זאת מאוחר יותר.</p>
                    <div className="modal-actions">
                        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'שומר...' : 'אישור'}
                        </Button>
                        <Button variant="outlined" onClick={handleBack}>
                            חזור
                        </Button>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <style jsx>{`
        .edit-billing-modal {
          max-width: 500px;
          width: 90vw;
          padding: 30px;
          background: white;
          border-radius: 10px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .edit-billing-modal h3 {
          text-align: center;
          margin-bottom: 20px;
          color: var(--text);
        }

        .options-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .option-btn {
          background-color: transparent;
          color: var(--bgSoft);
          border: 2px solid var(--bgSoft);
          padding: 15px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .option-btn:hover {
          background-color: var(--bgSoft);
          color: white;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin: 20px 0;
        }

        .confirmation-box {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 25px;
        }

        .modal-actions button {
          min-width: 120px;
        }

        .error-message {
          color: #d32f2f;
          background-color: #ffebee;
          padding: 10px;
          border-radius: 5px;
          margin-top: 15px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .edit-billing-modal {
            padding: 20px;
          }
          
          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
};

export default EditBillingDetailsModal;
