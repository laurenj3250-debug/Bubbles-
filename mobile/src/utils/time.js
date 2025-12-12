export const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};
