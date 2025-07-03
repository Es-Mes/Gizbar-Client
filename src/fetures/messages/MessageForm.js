// MessageForm.jsx
import React, { useState } from "react";
import {
  TextField,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { useGetAgentQuery } from "../../fetures/agent/apiSlice";
import { useSendCustomMessageMutation } from "../../app/api/messagesApiSlice";

const MessageForm = () => {
  const { data: agent } = useGetAgentQuery();
  const customers = agent?.customers || [];

  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [forAll, setForAll] = useState(false);
  const [messageType, setMessageType] = useState("message"); // message | reminder
  const [deliveryMethod, setDeliveryMethod] = useState("both"); // email | phone | both
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sendNow, setSendNow] = useState(true);

  const [sendCustomMessage, { isLoading, isSuccess, isError }] = useSendCustomMessageMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!forAll && selectedCustomerIds.length === 0) {
      alert("יש לבחור לקוחות או לסמן שליחה לכולם");
      return;
    }

    const finalScheduledAt = sendNow ? new Date().toISOString() : new Date(scheduledAt).toISOString();

    try {
      await sendCustomMessage({
        type: deliveryMethod,
        messageType,
        forAll,
        customerIds: forAll ? [] : selectedCustomerIds,
        subject,
        body,
        scheduledAt: finalScheduledAt,
      }).unwrap();

      alert("ההודעה נשלחה בהצלחה!");
      setSubject("");
      setBody("");
      setScheduledAt("");
      setSelectedCustomerIds([]);
      setForAll(false);
      setSendNow(true);
    } catch (err) {
      console.error("שגיאה בשליחה:", err);
      alert("אירעה שגיאה בשליחת ההודעה");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        שליחת הודעה / תזכורת
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>סוג ההודעה</InputLabel>
        <Select value={messageType} onChange={(e) => setMessageType(e.target.value)} label="סוג ההודעה">
          <MenuItem value="message">הודעה כללית</MenuItem>
          <MenuItem value="reminder">תזכורת לתשלום</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>אופן השליחה</InputLabel>
        <Select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} label="אופן השליחה">
          <MenuItem value="both">אימייל וטלפון</MenuItem>
          <MenuItem value="email">אימייל בלבד</MenuItem>
          <MenuItem value="phone">טלפון בלבד</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={<Checkbox checked={forAll} onChange={(e) => setForAll(e.target.checked)} />}
        label="שליחה לכל הלקוחות"
      />

      {!forAll && (
        <FormControl fullWidth margin="normal">
          <InputLabel id="customer-select-label">לקוחות</InputLabel>
          <Select
            labelId="customer-select-label"
            multiple
            value={selectedCustomerIds}
            onChange={(e) => setSelectedCustomerIds(e.target.value)}
            renderValue={(selected) =>
              customers
                .filter((c) => selected.includes(c._id))
                .map((c) => c.name)
                .join(", ")
            }
          >
            {customers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                <Checkbox checked={selectedCustomerIds.includes(c._id)} />
                {c.name} ({c.phone})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        label="נושא ההודעה"
        fullWidth
        margin="normal"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />

      <TextField
        label="גוף ההודעה"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />

      <FormControlLabel
        control={<Checkbox checked={sendNow} onChange={(e) => setSendNow(e.target.checked)} />}
        label="שליחה מיידית"
      />

      {!sendNow && (
        <TextField
          label="זמן שליחה"
          type="datetime-local"
          fullWidth
          margin="normal"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
      )}

      <Button type="submit" variant="contained" fullWidth disabled={isLoading} sx={{ mt: 2 }}>
        {isLoading ? "שולח..." : "שלח הודעה"}
      </Button>

      {isSuccess && <Typography color="green" sx={{ mt: 1 }}>✓ נשלח בהצלחה</Typography>}
      {isError && <Typography color="red" sx={{ mt: 1 }}>✗ שגיאה בשליחה</Typography>}
    </Box>
  );
};

export default MessageForm;
