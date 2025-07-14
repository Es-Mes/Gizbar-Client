import React, { useMemo } from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from "@mui/material";
import { GrUser, GrPhone, GrMail, GrLocation, GrCreditCard, GrGroup, GrTime } from "react-icons/gr";
import { MdDateRange, MdTrendingUp } from "react-icons/md";

const AgentDetailsView = ({ agent, onClose }) => {
    // חישוב נתונים סטטיסטיים
    const agentStats = useMemo(() => {
        if (!agent) return {};

        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        // מידע בסיסי
        const joinDate = agent.createdAt ? new Date(agent.createdAt) : null;
        const daysSinceJoin = joinDate ? Math.floor((now - joinDate) / (1000 * 60 * 60 * 24)) : 0;

        // נתוני לקוחות
        const totalCustomers = agent.customers?.length || 0;
        const activeCustomers = agent.customers?.filter(customer =>
            customer.active !== false
        ).length || 0;

        // הערכת מספר עסקאות (אם יש נתונים)
        // זה יהיה מוערך בצד השרת בדרך כלל
        const estimatedTransactionsLastMonth = Math.floor(totalCustomers * 2.5); // הערכה
        const estimatedTransactionsLast3Months = Math.floor(totalCustomers * 7);
        const estimatedTransactionsLastYear = Math.floor(totalCustomers * 25);

        return {
            joinDate,
            daysSinceJoin,
            totalCustomers,
            activeCustomers,
            estimatedTransactionsLastMonth,
            estimatedTransactionsLast3Months,
            estimatedTransactionsLastYear,
            paymentTypeText: getPaymentTypeText(agent.paymentType)
        };
    }, [agent]);

    const getPaymentTypeText = (paymentType) => {
        switch (paymentType) {
            case 'nedarim': return 'נדרים';
            case 'gizbar': return 'גזבר';
            case 'none': return 'ללא סליקה';
            default: return 'לא מוגדר';
        }
    };

    const getStatusColor = (value, thresholds) => {
        if (value >= thresholds.high) return "#4CAF50"; // ירוק
        if (value >= thresholds.medium) return "#FF9800"; // כתום
        return "#f44336"; // אדום
    };

    if (!agent) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography>לא נמצאו נתונים עבור המשתמש</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            {/* כותרת */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                    פרטי משתמש - {agent.first_name} {agent.last_name}
                </Typography>
                <Chip
                    label={`משתמש פעיל ${agentStats.daysSinceJoin} ימים`}
                    color="primary"
                    variant="outlined"
                />
            </Box>

            <Grid container spacing={3}>
                {/* פרטים אישיים */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: "100%" }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            <GrUser style={{ marginRight: "8px", verticalAlign: "middle" }} />
                            פרטים אישיים
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <List dense>
                            <ListItem>
                                <ListItemIcon><GrUser /></ListItemIcon>
                                <ListItemText
                                    primary="שם מלא"
                                    secondary={`${agent.first_name} ${agent.last_name}`}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon><GrPhone /></ListItemIcon>
                                <ListItemText
                                    primary="טלפון"
                                    secondary={agent.phone || "לא מוגדר"}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon><GrMail /></ListItemIcon>
                                <ListItemText
                                    primary="אימייל"
                                    secondary={agent.email || "לא מוגדר"}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon><GrLocation /></ListItemIcon>
                                <ListItemText
                                    primary="עיר"
                                    secondary={agent.city || "לא מוגדר"}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon><MdDateRange /></ListItemIcon>
                                <ListItemText
                                    primary="תאריך הצטרפות"
                                    secondary={agentStats.joinDate?.toLocaleDateString('he-IL') || "לא זמין"}
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* הגדרות מערכת */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: "100%" }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            <GrCreditCard style={{ marginRight: "8px", verticalAlign: "middle" }} />
                            הגדרות מערכת
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <List dense>
                            <ListItem>
                                <ListItemIcon><GrCreditCard /></ListItemIcon>
                                <ListItemText
                                    primary="סוג סליקת אשראי"
                                    secondary={
                                        <Chip
                                            label={agentStats.paymentTypeText}
                                            size="small"
                                            color={agent.paymentType === 'none' ? 'default' : 'success'}
                                        />
                                    }
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon><GrTime /></ListItemIcon>
                                <ListItemText
                                    primary="סטטוס חשבון"
                                    secondary={
                                        <Chip
                                            label={agent.active !== false ? 'פעיל' : 'מושבת'}
                                            size="small"
                                            color={agent.active !== false ? 'success' : 'error'}
                                        />
                                    }
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* סטטיסטיקות לקוחות */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: "100%" }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            <GrGroup style={{ marginRight: "8px", verticalAlign: "middle" }} />
                            נתוני לקוחות
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h3" color={getStatusColor(agentStats.totalCustomers, { high: 20, medium: 5 })}>
                                    {agentStats.totalCustomers}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    סה"כ לקוחות
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h4" color={getStatusColor(agentStats.activeCustomers, { high: 15, medium: 3 })}>
                                    {agentStats.activeCustomers}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    לקוחות פעילים
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* הערכת פעילות */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: "100%" }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            <MdTrendingUp style={{ marginRight: "8px", verticalAlign: "middle" }} />
                            הערכת פעילות
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2">עסקאות מוערכות בחודש האחרון:</Typography>
                                <Chip
                                    label={agentStats.estimatedTransactionsLastMonth}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2">עסקאות מוערכות ב-3 חודשים:</Typography>
                                <Chip
                                    label={agentStats.estimatedTransactionsLast3Months}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2">עסקאות מוערכות בשנה האחרונה:</Typography>
                                <Chip
                                    label={agentStats.estimatedTransactionsLastYear}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>

                        <Box sx={{ mt: 2, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                                * נתונים מוערכים על בסיס מספר הלקוחות ופעילות ממוצעת
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* כפתור סגירה */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        padding: "10px 30px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                >
                    סגור
                </button>
            </Box>
        </Box>
    );
};

export default AgentDetailsView;
