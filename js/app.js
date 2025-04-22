// app.js - Main application file that ties everything together

// Global variables
const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID_HERE/exec';

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    // Add type class
    if (type) {
        toast.classList.add(type);
    }
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize the application
function initApp() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Set up event listeners for tab switching
    setupTabSwitching();
    
    // Set up event listeners for form validation
    setupFormValidation();
}

// Set up tab switching functionality
function setupTabSwitching() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.toggle('active', b === btn);
            });
            
            // Show corresponding tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });
        });
    });
}

// Set up form validation
function setupFormValidation() {
    // Password confirmation validation
    const registerPassword = document.getElementById('register-password');
    const confirmPassword = document.getElementById('register-confirm-password');
    
    if (registerPassword && confirmPassword) {
        confirmPassword.addEventListener('input', () => {
            if (registerPassword.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Passwords do not match');
            } else {
                confirmPassword.setCustomValidity('');
            }
        });
        
        registerPassword.addEventListener('input', () => {
            if (registerPassword.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Passwords do not match');
            } else {
                confirmPassword.setCustomValidity('');
            }
        });
    }
}

// Handle errors gracefully
function handleError(error, message = 'An error occurred') {
    console.error(error);
    showToast(message, 'error');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        initApp();
    } catch (error) {
        handleError(error, 'Failed to initialize application');
    }
});
