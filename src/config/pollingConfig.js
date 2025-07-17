// קובץ ניהול polling intervals לאופטימיזציה של ביצועים
export const POLLING_INTERVALS = {
    // עמוד הבית - חשוב לקבל עדכונים מהירים יחסית
    HOME_TRANSACTIONS: 60000, // דקה אחת

    // רשימת כל העסקאות - עדכון בינוני
    ALL_TRANSACTIONS: 90000, // דקה וחצי

    // פרטי לקוח - עדכון איטי יותר
    CUSTOMER_DETAILS: 120000, // 2 דקות

    // עסקאות כספק - עדכון איטי יותר
    PROVIDER_TRANSACTIONS: 90000, // דקה וחצי

    // הגדרות אגרסיביות לחיבור איטי
    SLOW_CONNECTION: {
        HOME_TRANSACTIONS: 120000, // 2 דקות
        ALL_TRANSACTIONS: 180000, // 3 דקות
        CUSTOMER_DETAILS: 300000, // 5 דקות
        PROVIDER_TRANSACTIONS: 180000, // 3 דקות
    }
};

// אפשרות לכבות polling לחיסכון במשאבים
export const POLLING_ENABLED = true;

// פונקציה לקבלת interval מותאם למהירות חיבור
export const getPollingInterval = (type, isSlowConnection = false) => {
    if (!POLLING_ENABLED) return 0; // כיבוי polling

    if (isSlowConnection) {
        return POLLING_INTERVALS.SLOW_CONNECTION[type] || POLLING_INTERVALS[type];
    }

    return POLLING_INTERVALS[type] || 60000;
};

// פונקציות עזר
export const disablePolling = () => ({ pollingInterval: 0 });
export const createPollingConfig = (type, options = {}) => ({
    pollingInterval: getPollingInterval(type, options.isSlowConnection),
    ...options
});
