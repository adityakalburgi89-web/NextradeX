/**
 * STOMP / WebSocket Helper Utilities
 */
export const buildTopicUrl = (topic) => topic.startsWith('/') ? topic : `/${topic}`;
