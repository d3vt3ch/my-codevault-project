// viewer.js - Handles code viewing functionality

// Switch between code tabs in the viewer
function switchCodeTab(tabName) {
    // Update active tab
    document.querySelectorAll('.code-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Show corresponding panel
    const panelId = tabName + '-panel';
    document.querySelectorAll('.code-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === panelId);
    });
}

// Format code for better display
function formatCode(code, language) {
    if (!code || code.trim() === '') {
        return language === 'html' ? '<!-- No code provided -->' : '// No code provided';
    }
    
    // Return the code as is, Prism.js will handle the formatting
    return code;
}

// Detect language from code content
function detectLanguage(code) {
    if (!code || code.trim() === '') return 'plaintext';
    
    // Simple detection based on common patterns
    if (code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('</div>')) {
        return 'html';
    } else if (code.includes('function') || code.includes('const ') || code.includes('var ') || code.includes('let ')) {
        return 'javascript';
    } else if (code.includes('import ') && code.includes('from ')) {
        return 'javascript';
    } else if (code.includes('class ') && code.includes('{')) {
        return 'javascript';
    } else if (code.includes('def ') && code.includes(':')) {
        return 'python';
    } else if (code.includes('<?php')) {
        return 'php';
    } else if (code.includes('@media') || code.includes('margin:') || code.includes('padding:')) {
        return 'css';
    }
    
    return 'plaintext';
}

// Copy code to clipboard
function copyCodeToClipboard(codeType) {
    const codeElement = document.getElementById(`viewer-${codeType}-code`);
    const code = codeElement.textContent;
    
    // Create a temporary textarea element to copy from
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(`${codeType.charAt(0).toUpperCase() + codeType.slice(1)} code copied to clipboard!`, 'success');
        } else {
            showToast('Failed to copy code.', 'error');
        }
    } catch (err) {
        console.error('Error copying code:', err);
        showToast('Failed to copy code.', 'error');
    }
    
    document.body.removeChild(textarea);
}

// Add copy buttons to code panels
function addCopyButtons() {
    const frontendPanel = document.getElementById('frontend-panel');
    const backendPanel = document.getElementById('backend-panel');
    
    // Add button to frontend panel if it doesn't exist
    if (!frontendPanel.querySelector('.copy-btn')) {
        const frontendBtn = document.createElement('button');
        frontendBtn.className = 'btn btn-icon copy-btn';
        frontendBtn.innerHTML = '<i class="fas fa-copy"></i>';
        frontendBtn.title = 'Copy code';
        frontendBtn.onclick = () => copyCodeToClipboard('frontend');
        frontendPanel.appendChild(frontendBtn);
    }
    
    // Add button to backend panel if it doesn't exist
    if (!backendPanel.querySelector('.copy-btn')) {
        const backendBtn = document.createElement('button');
        backendBtn.className = 'btn btn-icon copy-btn';
        backendBtn.innerHTML = '<i class="fas fa-copy"></i>';
        backendBtn.title = 'Copy code';
        backendBtn.onclick = () => copyCodeToClipboard('backend');
        backendPanel.appendChild(backendBtn);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Code tabs in viewer
    document.querySelectorAll('.code-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchCodeTab(tab.dataset.tab);
        });
    });
    
    // Add copy buttons to code panels
    addCopyButtons();
});
