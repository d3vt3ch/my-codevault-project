// Modified auth.js to use the new API proxy

// DOM elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const resetForm = document.getElementById('reset-form');
const logoutBtn = document.getElementById('logout-btn');

// Event listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

if (resetForm) {
    resetForm.addEventListener('submit', handleReset);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    try {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Validate inputs
        if (!email || !password) {
            showToast('Email and password are required', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Call API
        const result = await loginUser(email, password);
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Show success message
            showToast('Login successful', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.hash = '#dashboard';
                showDashboard();
            }, 1000);
        } else {
            showToast(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

/**
 * Handle register form submission
 */
async function handleRegister(e) {
    e.preventDefault();
    
    try {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // Validate inputs
        if (!name || !email || !password) {
            showToast('All fields are required', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;
        
        // Call API
        const result = await registerUser(name, email, password);
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // Show success message
            showToast('Registration successful. Please log in.', 'success');
            
            // Redirect to login
            setTimeout(() => {
                window.location.hash = '#login';
                
                // Pre-fill email
                const loginEmail = document.getElementById('login-email');
                if (loginEmail) {
                    loginEmail.value = email;
                }
            }, 1000);
        } else {
            showToast(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

/**
 * Handle reset password form submission
 */
async function handleReset(e) {
    e.preventDefault();
    
    try {
        const email = document.getElementById('reset-email').value;
        
        // Validate inputs
        if (!email) {
            showToast('Email is required', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = resetForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Call API
        const result = await resetPassword(email);
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // Show success message
            showToast('If your email is registered, you will receive reset instructions.', 'success');
            
            // Redirect to login
            setTimeout(() => {
                window.location.hash = '#login';
            }, 2000);
        } else {
            showToast(result.message || 'Reset failed', 'error');
        }
    } catch (error) {
        console.error('Reset error:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    
    // Show success message
    showToast('Logged out successfully', 'success');
    
    // Redirect to login
    setTimeout(() => {
        window.location.hash = '#login';
    }, 1000);
}

/**
 * Check if user is logged in
 */
function checkAuthStatus() {
    const user = getLoggedInUser();
    
    if (user) {
        // User is logged in
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'block';
        });
        
        document.querySelectorAll('.auth-not-required').forEach(el => {
            el.style.display = 'none';
        });
        
        // Set user name
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = user.name;
        }
        
        // Show dashboard
        if (window.location.hash === '' || window.location.hash === '#login' || window.location.hash === '#register' || window.location.hash === '#reset') {
            window.location.hash = '#dashboard';
        }
        
        // Load content based on hash
        handleHashChange();
    } else {
        // User is not logged in
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.auth-not-required').forEach(el => {
            el.style.display = 'block';
        });
        
        // Show login
        if (window.location.hash === '' || window.location.hash === '#dashboard') {
            window.location.hash = '#login';
        }
        
        // Load content based on hash
        handleHashChange();
    }
}

/**
 * Handle hash change
 */
function handleHashChange() {
    const hash = window.location.hash;
    
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show content based on hash
    switch (hash) {
        case '#login':
            document.getElementById('login-tab').classList.add('active');
            document.querySelector('[data-tab="login-tab"]').classList.add('active');
            break;
        case '#register':
            document.getElementById('register-tab').classList.add('active');
            document.querySelector('[data-tab="register-tab"]').classList.add('active');
            break;
        case '#reset':
            document.getElementById('reset-tab').classList.add('active');
            document.querySelector('[data-tab="reset-tab"]').classList.add('active');
            break;
        case '#dashboard':
            document.getElementById('dashboard-tab').classList.add('active');
            document.querySelector('[data-tab="dashboard-tab"]').classList.add('active');
            loadDashboard();
            break;
        case '#shared':
            document.getElementById('shared-tab').classList.add('active');
            document.querySelector('[data-tab="shared-tab"]').classList.add('active');
            loadSharedProjects();
            break;
        case '#create':
            document.getElementById('create-tab').classList.add('active');
            document.querySelector('[data-tab="create-tab"]').classList.add('active');
            break;
        case '#edit':
            document.getElementById('edit-tab').classList.add('active');
            document.querySelector('[data-tab="edit-tab"]').classList.add('active');
            loadProjectForEdit();
            break;
        case '#view':
            document.getElementById('view-tab').classList.add('active');
            document.querySelector('[data-tab="view-tab"]').classList.add('active');
            loadProjectForView();
            break;
        default:
            // Default to login or dashboard
            if (getLoggedInUser()) {
                document.getElementById('dashboard-tab').classList.add('active');
                document.querySelector('[data-tab="dashboard-tab"]').classList.add('active');
                loadDashboard();
            } else {
                document.getElementById('login-tab').classList.add('active');
                document.querySelector('[data-tab="login-tab"]').classList.add('active');
            }
    }
}

/**
 * Get logged in user
 */
function getLoggedInUser() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }
    return null;
}

/**
 * Show dashboard
 */
function showDashboard() {
    // Update hash
    window.location.hash = '#dashboard';
    
    // Load dashboard content
    loadDashboard();
}

// API Functions

/**
 * Register a new user
 */
async function registerUser(name, email, password) {
    try {
        // Use the new API proxy
        return await window.apiRequest('register', {
            name,
            email,
            password
        });
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

/**
 * Login a user
 */
async function loginUser(email, password) {
    try {
        // Use the new API proxy
        return await window.apiRequest('login', {
            email,
            password
        });
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

/**
 * Reset a user's password
 */
async function resetPassword(email) {
    try {
        // Use the new API proxy
        return await window.apiRequest('resetPassword', {
            email
        });
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

// Listen for hash changes
window.addEventListener('hashchange', handleHashChange);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check auth status
    checkAuthStatus();
});
