function checkAuth() {
    // If we're already on the login page, no need to check
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
        return;
    }

    fetch('/api/check-auth', {
        credentials: 'same-origin'
    })
        .then(response => {
            if (!response.ok) {
                window.location.href = '/index.html';
            }
        })
        .catch(() => {
            window.location.href = '/index.html';
        });
}

// Check on page load
checkAuth();

// Check when visibility changes (tab focus)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkAuth();
    }
});