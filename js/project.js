// project.js - Handles project creation and editing functionality

// Global variables
let currentProjectId = null;
let isEditMode = false;
let autoSaveInterval = null;

// Show project form for creating or editing a project
function showProjectForm(projectId = null) {
    isEditMode = !!projectId;
    currentProjectId = projectId;
    
    // Update form title
    document.getElementById('project-form-title').textContent = isEditMode ? 'Edit Project' : 'Create New Project';
    
    // Clear form or populate with project data
    if (isEditMode) {
        populateProjectForm(projectId);
    } else {
        resetProjectForm();
        
        // Check for draft in localStorage
        const draft = localStorage.getItem('projectDraft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                document.getElementById('project-name').value = draftData.name || '';
                document.getElementById('project-category').value = draftData.category || 'Web Development';
                document.getElementById('project-version').value = draftData.version || '';
                document.getElementById('project-thumbnail').value = draftData.thumbnail || '';
                document.getElementById('frontend-code').value = draftData.frontendCode || '';
                document.getElementById('backend-code').value = draftData.backendCode || '';
                document.getElementById('project-url').value = draftData.url || '';
                document.getElementById('project-remarks').value = draftData.remarks || '';
                document.getElementById('project-private').checked = draftData.isPrivate || false;
                
                showToast('Draft loaded from local storage.', 'info');
            } catch (error) {
                console.error('Error loading draft:', error);
                localStorage.removeItem('projectDraft');
            }
        }
    }
    
    // Show the form
    document.getElementById('project-form').classList.remove('hidden');
    
    // Start auto-save for new projects
    if (!isEditMode) {
        startAutoSave();
    }
}

// Populate form with project data
async function populateProjectForm(projectId) {
    try {
        // Find project in userProjects array
        const project = userProjects.find(p => p.id === projectId);
        
        if (!project) {
            // If not found in memory, fetch from API
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getProject',
                    projectId: projectId,
                    userId: currentUser.id
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                populateFormFields(data.project);
            } else {
                showToast('Failed to load project data.', 'error');
                hideProjectForm();
            }
        } else {
            populateFormFields(project);
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('An error occurred while loading project data.', 'error');
        hideProjectForm();
    }
}

// Populate form fields with project data
function populateFormFields(project) {
    document.getElementById('project-id').value = project.id;
    document.getElementById('project-name').value = project.name || '';
    document.getElementById('project-category').value = project.category || 'Web Development';
    document.getElementById('project-version').value = project.version || '';
    document.getElementById('project-thumbnail').value = project.thumbnail || '';
    document.getElementById('frontend-code').value = project.frontendCode || '';
    document.getElementById('backend-code').value = project.backendCode || '';
    document.getElementById('project-url').value = project.url || '';
    document.getElementById('project-remarks').value = project.remarks || '';
    document.getElementById('project-private').checked = project.isPrivate || false;
}

// Reset project form
function resetProjectForm() {
    document.getElementById('form-project').reset();
    document.getElementById('project-id').value = '';
}

// Hide project form
function hideProjectForm() {
    document.getElementById('project-form').classList.add('hidden');
    stopAutoSave();
    currentProjectId = null;
    isEditMode = false;
}

// Start auto-save functionality
function startAutoSave() {
    // Clear any existing interval
    stopAutoSave();
    
    // Set new interval (save every 30 seconds)
    autoSaveInterval = setInterval(() => {
        saveProjectDraft();
    }, 30000);
}

// Stop auto-save
function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Save project draft to localStorage
function saveProjectDraft() {
    if (isEditMode) return; // Don't auto-save in edit mode
    
    const draftData = {
        name: document.getElementById('project-name').value,
        category: document.getElementById('project-category').value,
        version: document.getElementById('project-version').value,
        thumbnail: document.getElementById('project-thumbnail').value,
        frontendCode: document.getElementById('frontend-code').value,
        backendCode: document.getElementById('backend-code').value,
        url: document.getElementById('project-url').value,
        remarks: document.getElementById('project-remarks').value,
        isPrivate: document.getElementById('project-private').checked
    };
    
    // Only save if there's actual content
    if (draftData.name || draftData.frontendCode || draftData.backendCode) {
        localStorage.setItem('projectDraft', JSON.stringify(draftData));
        console.log('Project draft auto-saved');
    }
}

// Handle project form submission
async function handleProjectSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const projectId = document.getElementById('project-id').value;
    const projectData = {
        name: document.getElementById('project-name').value.trim(),
        category: document.getElementById('project-category').value,
        version: document.getElementById('project-version').value.trim(),
        thumbnail: document.getElementById('project-thumbnail').value.trim(),
        frontendCode: document.getElementById('frontend-code').value,
        backendCode: document.getElementById('backend-code').value,
        url: document.getElementById('project-url').value.trim(),
        remarks: document.getElementById('project-remarks').value.trim(),
        isPrivate: document.getElementById('project-private').checked,
        userId: currentUser.id
    };
    
    // Validate required fields
    if (!projectData.name) {
        showToast('Project name is required.', 'error');
        return;
    }
    
    if (!projectData.version) {
        showToast('Version is required.', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        // Determine if creating or updating
        const action = isEditMode ? 'updateProject' : 'createProject';
        
        // Add project ID if editing
        if (isEditMode) {
            projectData.id = projectId;
        }
        
        // Call the backend API
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                project: projectData
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear draft if creating new project
            if (!isEditMode) {
                localStorage.removeItem('projectDraft');
            }
            
            // Show success message
            showToast(`Project ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
            
            // Hide form and reload projects
            hideProjectForm();
            loadUserProjects();
            
            // Also reload shared projects if the privacy setting might have changed
            if (isEditMode) {
                loadSharedProjects();
            }
        } else {
            showToast(data.message || `Failed to ${isEditMode ? 'update' : 'create'} project.`, 'error');
        }
    } catch (error) {
        console.error('API error:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Delete a project
async function deleteProject(projectId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Call the backend API
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteProject',
                projectId: projectId,
                userId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Project deleted successfully.', 'success');
            loadUserProjects();
            loadSharedProjects();
        } else {
            showToast(data.message || 'Failed to delete project.', 'error');
        }
    } catch (error) {
        console.error('API error:', error);
        showToast('An error occurred while deleting the project.', 'error');
    }
}

// Edit a project
function editProject(projectId) {
    showProjectForm(projectId);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Project form submission
    document.getElementById('form-project').addEventListener('submit', handleProjectSubmit);
    
    // Cancel button
    document.getElementById('cancel-project-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            hideProjectForm();
        }
    });
    
    // Close form button
    document.getElementById('close-form-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to close the form? Any unsaved changes will be lost.')) {
            hideProjectForm();
        }
    });
});
