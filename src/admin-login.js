document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const feedback = document.getElementById('login-feedback');
    const submitButton = form.querySelector('button[type="submit"]');
    const apiUrl = `${window.PORTFOLIO_API_BASE_URL}/auth`;
    if (new URLSearchParams(window.location.search).get('session') === 'unavailable') {
        feedback.textContent = 'Could not verify your previous session. Sign in again to continue.';
    }

    document.getElementById('password-toggle').addEventListener('click', (event) => {
        const toggle = event.currentTarget;
        const showPassword = passwordInput.type === 'password';
        passwordInput.type = showPassword ? 'text' : 'password';
        toggle.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
        toggle.innerHTML = `<i class="far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i>`;
    });

    fetch(`${apiUrl}/me`, { credentials: 'include' })
        .then(async (response) => {
            if (response.ok) {
                window.location.replace('admin.html');
                return;
            }
            if (response.status !== 401) {
                const result = await response.json();
                throw new Error(result.error || 'Could not verify the admin session.');
            }
        })
        .catch((error) => {
            console.error('Could not check the admin session:', error);
            feedback.textContent = 'Could not verify the sign-in service. Check the connection and try again.';
        });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedback.textContent = '';
        submitButton.disabled = true;
        submitButton.querySelector('span').textContent = 'Signing in…';

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
            });
            const result = await response.json();
            if (!response.ok) {
                feedback.textContent = result.error || 'Could not sign in. Please try again.';
                return;
            }
            window.location.replace('admin.html');
        } catch (error) {
            console.error('Admin login request failed:', error);
            feedback.textContent = 'Could not reach the sign-in service. Check the connection and try again.';
        } finally {
            submitButton.disabled = false;
            submitButton.querySelector('span').textContent = 'Sign in to admin';
        }
    });
});
