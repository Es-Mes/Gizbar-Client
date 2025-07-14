import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import { toast } from 'react-toastify';
import { useSendCustomMessageMutation, useSendMessageToAgentsMutation } from "../../../app/api/messagesApiSlice";

const SendMessageToAgent = ({ agent, onSuccess }) => {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState("both");
    const [sendNow, setSendNow] = useState(true);
    const [scheduledAt, setScheduledAt] = useState("");

    const [sendCustomMessage, { isLoading }] = useSendCustomMessageMutation();
    const [sendMessageToAgents] = useSendMessageToAgentsMutation();

    // תבניות הודעות מוכנות
    const messageTemplates = {
        reminder: {
            subject: "תזכורת חשובה",
            body: `שלום ${agent.first_name},\n\nזוהי תזכורת חשובה:\n\n[תוכן התזכורת]\n\nבברכה,\nצוות גזבר`
        },
        system_update: {
            subject: "עדכון מערכת חשוב",
            body: `היי ${agent.first_name},\n\nאנו רוצים להודיע לך על עדכון חשוב במערכת הגזבר:\n\n[תוכן העדכון]\n\nבברכה,\nצוות גזבר`
        },
        personal_message: {
            subject: "הודעה אישית",
            body: `שלום ${agent.first_name},\n\n[תוכן ההודעה]\n\nבברכה,\nצוות גזבר`
        }
    };

    const handleTemplateSelect = (templateKey) => {
        const template = messageTemplates[templateKey];
        setSubject(template.subject);
        setBody(template.body);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!subject.trim() || !body.trim()) {
            toast.error("יש למלא נושא וגוף הודעה");
            return;
        }

        const finalScheduledAt = sendNow ? new Date().toISOString() : new Date(scheduledAt).toISOString();

        try {
            // ניסיון ראשון עם API הרגיל
            try {
                await sendCustomMessage({
                    type: deliveryMethod,
                    messageType: "message",
                    forAll: false,
                    agentIds: [agent._id], // שליחה לסוכן ספציפי
                    subject,
                    body,
                    scheduledAt: finalScheduledAt,
                }).unwrap();
            } catch (firstError) {
                // אם נכשל, ננסה עם API המיוחד לסוכנים
                await sendMessageToAgents({
                    type: deliveryMethod,
                    messageType: "message",
                    targetAgentId: agent._id,
                    subject,
                    body,
                    scheduledAt: finalScheduledAt,
                }).unwrap();
            }

            toast.success("ההודעה נשלחה בהצלחה! 👍", { icon: false });

            // איפוס השדות
            setSubject("");
            setBody("");
            setScheduledAt("");

            if (onSuccess) {
                setTimeout(() => onSuccess(), 1500);
            }

        } catch (err) {
            console.error("שגיאה בשליחה:", err);
            toast.error("אירעה שגיאה בשליחת ההודעה");
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 500,
                mx: "auto",
                p: 3,
                maxHeight: "80vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <div style={{
                textAlign: "center",
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f8f9ff",
                borderRadius: "8px"
            }}>
                <Typography variant="h6" color="primary" gutterBottom>
                    שליחת הודעה אישית
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    למשתמש: {agent.first_name} {agent.last_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    טלפון: {agent.phone} | אימייל: {agent.email}
                </Typography>
            </div>

            {/* תבניות הודעות */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    תבניות הודעות מוכנות:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleTemplateSelect('reminder')}
                    >
                        תזכורת
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleTemplateSelect('system_update')}
                    >
                        עדכון מערכת
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleTemplateSelect('personal_message')}
                    >
                        הודעה אישית
                    </Button>
                </Box>
            </Box>

            <FormControl fullWidth margin="normal">
                <InputLabel>אופן השליחה</InputLabel>
                <Select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    label="אופן השליחה"
                >
                    <MenuItem value="both">אימייל וטלפון</MenuItem>
                    <MenuItem value="email">אימייל בלבד</MenuItem>
                    <MenuItem value="phone">טלפון בלבד</MenuItem>
                </Select>
            </FormControl>

            <TextField
                label="נושא ההודעה"
                fullWidth
                margin="normal"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="הכנס נושא ההודעה..."
            />

            <TextField
                label="גוף ההודעה"
                fullWidth
                multiline
                rows={6}
                margin="normal"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                placeholder="הכנס את תוכן ההודעה..."
                sx={{
                    '& .MuiInputBase-root': {
                        minHeight: '150px',
                        overflow: 'auto'
                    }
                }}
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={sendNow}
                        onChange={(e) => setSendNow(e.target.checked)}
                    />
                }
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

            <Box sx={{
                mt: 3,
                display: "flex",
                gap: 2,
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                pt: 2,
                borderTop: "1px solid #e0e0e0"
            }}>
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={{
                        backgroundColor: "#4CAF50",
                        "&:hover": { backgroundColor: "#45a049" }
                    }}
                >
                    {isLoading ? "שולח..." : "שלח הודעה"}
                </Button>

                <Button
                    type="button"
                    variant="outlined"
                    onClick={() => onSuccess && onSuccess()}
                    sx={{ minWidth: "100px" }}
                >
                    ביטול
                </Button>
            </Box>
        </Box>
    );
};

export default SendMessageToAgent;
