// Auth Constants - ניהול כל הקבועים הקשורים לאימות במקום אחד

export const AUTH_TIMEOUTS = {
    // זמן חוסר פעילות עד הפסקת חיבור (שעה אחת)
    INACTIVITY_TIMEOUT: 60 * 60 * 1000, // 60 דקות

    // זמן לפני תפוגת הטוקן שנבצע רענון (5 דקות)
    REFRESH_BEFORE_EXPIRY: 5 * 60 * 1000, // 5 דקות

    // מינימום זמן בין רענונים (דקה אחת)
    MIN_TIME_BETWEEN_REFRESH: 60 * 1000, // 1 דקה

    // זמן פעילות אחרונה שמאפשר רענון (10 דקות)
    MAX_INACTIVE_TIME_FOR_REFRESH: 10 * 60 * 1000, // 10 דקות
};

export const USER_ACTIVITY_EVENTS = [
    "mousemove",
    "keydown",
    "click",
    "scroll",
    "touchstart",
    "focus",
    "blur"
];

export const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    EXPIRATION_TIME: 'expirationTime',
    PERSIST: 'persist'
};

export const AUTH_MESSAGES = {
    TOKEN_REFRESHED: 'Token refreshed successfully',
    TOKEN_REFRESH_FAILED: 'Token refresh failed',
    USER_INACTIVE: 'User inactive for 1 hour - requiring reauth',
    NO_RECENT_ACTIVITY: 'No recent activity - skipping refresh',
    INITIAL_REFRESH_SUCCESS: 'Initial token refresh successful',
    INITIAL_REFRESH_FAILED: 'Initial token refresh failed',
    USER_LOGGED_OUT: 'User logged out',
    REAUTH_REQUIRED: 'Reauth required',
    TOKEN_SET: 'Token set, expires at',
    REFRESH_SCHEDULED: 'Token refresh scheduled in'
};
