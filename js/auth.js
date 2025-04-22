// auth.js - Handles user authentication functionality

// Global variables
let currentUser = null;

// Check if user is already logged in
function checkAuthStatus() {
    const storedUser = localStorage.getItem('codeVaultUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            showAppContainer();
            updateUserGreeting();
            loadUserProjects();
            loadSharedProjects();
            return true;
        } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('codeVaultUser');
        }
    }
    return false;
}

// Show the specified auth form and hide others
function showAuthForm(formId) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.add('hidden');
    });
    document.getElementById(formId).classList.remove('hidden');
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    // Validate inputs
    if (!email || !password) {
        errorElement.textContent = 'Please enter both email and password.';
        return;
    }
    
    // Clear previous errors
    errorElement.textContent = '';
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    // Call the backend API
    loginUser(email, password)
        .then(user => {
            if (user) {
                // Store user in localStorage
                localStorage.setItem('codeVaultUser', JSON.stringify(user));
                currentUser = user;
                
                // Show success toast
                showToast('Login successful!', 'success');
                
                // Show app container
                showAppContainer();
                updateUserGreeting();
                loadUserProjects();
                loadSharedProjects();
            } else {
                errorElement.textContent = 'Invalid email or password.';
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            errorElement.textContent = 'An error occurred. Please try again.';
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
}

// Handle registration form submission
function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const errorElement = document.getElementById('register-error');
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        errorElement.textContent = 'Please fill in all fields.';
        return;
    }
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match.';
        return;
    }
    
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters long.';
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorElement.textContent = 'Please enter a valid email address.';
        return;
    }
    
    // Clear previous errors
    errorElement.textContent = '';
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    
    // Call the backend API
    registerUser(name, email, password)
        .then(result => {
            if (result.success) {
                // Show success toast
                showToast('Account created successfully!', 'success');
                
                // Switch to login form
                showAuthForm('login-form');
                
                // Pre-fill email in login form
                document.getElementById('login-email').value = email;
            } else {
                errorElement.textContent = result.message || 'Registration failed. Please try again.';
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            errorElement.textContent = 'An error occurred. Please try again.';
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
}

// Handle forgot password form submission
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value.trim();
    const errorElement = document.getElementById('forgot-error');
    const successElement = document.getElementById('forgot-success');
    
    // Validate inputs
    if (!email) {
        errorElement.textContent = 'Please enter your email address.';
        successElement.textContent = '';
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorElement.textContent = 'Please enter a valid email address.';
        successElement.textContent = '';
        return;
    }
    
    // Clear previous messages
    errorElement.textContent = '';
    successElement.textContent = '';
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Call the backend API
    resetPassword(email)
        .then(result => {
            if (result.success) {
                successElement.textContent = 'Password reset instructions have been sent to your email.';
                document.getElementById('forgot-email').value = '';
            } else {
                errorElement.textContent = result.message || 'Failed to send reset instructions. Please try again.';
            }
        })
        .catch(error => {
            console.error('Reset password error:', error);
            errorElement.textContent = 'An error occurred. Please try again.';
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
}

// Handle logout
function handleLogout() {
    // Clear user data
    localStorage.removeItem('codeVaultUser');
    currentUser = null;
    
    // Show auth container
    showAuthContainer();
    
    // Show success toast
    showToast('Logged out successfully!', 'success');
}

// Show app container and hide auth container
function showAppContainer() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
}

// Show auth container and hide app container
function showAuthContainer() {
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
}

// Update user greeting with user's name
function updateUserGreeting() {
    if (currentUser) {
        document.getElementById('user-greeting').textContent = `Hello, ${currentUser.name}`;
    }
}

// API Functions (to be replaced with actual API calls)

// Login user
async function loginUser(email, password) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        // Call the Google Sheets Web App API
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.user;
        } else {
            console.error('Login failed:', data.message);
            return null;
        }
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

// Register user
async function registerUser(name, email, password) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        // Call the Google Sheets Web App API
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                name: name,
                email: email,
                password: password
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

// Reset password
async function resetPassword(email) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        // Call the Google Sheets Web App API
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'resetPassword',
                email: email
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (!checkAuthStatus()) {
        showAuthContainer();
    }
    
    // Login form
    document.getElementById('form-login').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('form-register').addEventListener('submit', handleRegistration);
    
    // Forgot password form
    document.getElementById('form-forgot').addEventListener('submit', handleForgotPassword);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
});
