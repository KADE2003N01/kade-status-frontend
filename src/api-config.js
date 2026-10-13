const localApiHost = window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
window.PORTFOLIO_API_BASE_URL = window.PORTFOLIO_API_BASE_URL || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${localApiHost}:5000/api`
        : `${window.location.origin}/api`
);
