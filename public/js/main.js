// Form validation and submission handling
document.addEventListener('DOMContentLoaded', () => {
    // Hide error message on page load
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }

    // Login form handling
    const loginForm = document.querySelector('form[action="/login"]');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                showError('Please fill in all fields');
                return;
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.text();

                if (response.redirected) {
                    window.location.href = response.url;
                } else if (response.ok) {
                    window.location.href = '/dashboard';
                } else {
                    // If the response is HTML (which it is in our case), parse it to get the error
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const errorDiv = doc.querySelector('.error-message');
                    if (errorDiv) {
                        showError(errorDiv.textContent);
                    } else {
                        showError('Invalid username or password');
                    }
                }
            } catch (error) {
                showError('An error occurred. Please try again.');
            }
        });
    }

    // Registration form handling
    const registerForm = document.querySelector('form[action="/register"]');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const role = document.getElementById('role').value;

            // Validation
            if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !role) {
                showError('Please fill in all fields');
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            if (password.length < 8) {
                showError('Password must be at least 8 characters long');
                return;
            }

            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firstName, lastName, email, username, password, role
                    })
                });

                const data = await response.text();

                if (response.redirected) {
                    window.location.href = response.url;
                } else if (response.ok) {
                    window.location.href = '/dashboard';
                } else {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const errorDiv = doc.querySelector('.error-message');
                    if (errorDiv) {
                        showError(errorDiv.textContent);
                    } else {
                        showError('Registration failed. Please try again.');
                    }
                }
            } catch (error) {
                showError('An error occurred. Please try again.');
            }
        });
    }

    // Helper functions
    function showError(message) {
        const errorDiv = document.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';

            // Hide error after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password visibility toggle
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }
});
