// dashboard.js - Handles dashboard functionality

// Global variables
let userProjects = [];
let sharedProjects = [];

// Load user's projects
async function loadUserProjects() {
    if (!currentUser) return;
    
    try {
        // Show loading state
        const projectsGrid = document.getElementById('user-projects-grid');
        projectsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading projects...</div>';
        
        // Call the backend API
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getUserProjects',
                userId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            userProjects = data.projects || [];
            renderProjects(userProjects, 'user-projects-grid');
        } else {
            console.error('Failed to load projects:', data.message);
            projectsGrid.innerHTML = '<div class="error">Failed to load projects. Please try again.</div>';
        }
    } catch (error) {
        console.error('API error:', error);
        document.getElementById('user-projects-grid').innerHTML = 
            '<div class="error">An error occurred while loading projects. Please try again.</div>';
    }
}

// Load shared projects (public projects from other users)
async function loadSharedProjects() {
    if (!currentUser) return;
    
    try {
        // Show loading state
        const projectsGrid = document.getElementById('shared-projects-grid');
        projectsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading shared projects...</div>';
        
        // Call the backend API
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getSharedProjects',
                userId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            sharedProjects = data.projects || [];
            renderProjects(sharedProjects, 'shared-projects-grid');
        } else {
            console.error('Failed to load shared projects:', data.message);
            projectsGrid.innerHTML = '<div class="error">Failed to load shared projects. Please try again.</div>';
        }
    } catch (error) {
        console.error('API error:', error);
        document.getElementById('shared-projects-grid').innerHTML = 
            '<div class="error">An error occurred while loading shared projects. Please try again.</div>';
    }
}

// Render projects to the specified grid
function renderProjects(projects, gridId) {
    const projectsGrid = document.getElementById(gridId);
    
    if (projects.length === 0) {
        // Show empty state
        if (gridId === 'user-projects-grid') {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>You don't have any projects yet. Create your first project!</p>
                </div>
            `;
        } else {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-share-alt"></i>
                    <p>No shared projects available.</p>
                </div>
            `;
        }
        return;
    }
    
    // Generate HTML for each project
    const projectsHTML = projects.map(project => {
        const isOwner = project.userId === currentUser.id;
        const defaultThumbnail = 'img/default-thumbnail.jpg';
        const thumbnail = project.thumbnail || defaultThumbnail;
        const privacyIcon = project.isPrivate ? 'fa-lock' : 'fa-globe';
        
        return `
            <div class="project-card" data-id="${project.id}">
                <div class="project-thumbnail" style="background-image: url('${thumbnail}')">
                    <div class="project-privacy">
                        <i class="fas ${privacyIcon}"></i>
                    </div>
                </div>
                <div class="project-info">
                    <h3 class="project-title">${project.name}</h3>
                    <div class="project-meta">
                        <span>${project.category}</span>
                        <span>${project.version}</span>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-outline view-project" data-id="${project.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${isOwner ? `
                            <button class="btn btn-outline edit-project" data-id="${project.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-outline delete-project" data-id="${project.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    projectsGrid.innerHTML = projectsHTML;
    
    // Add event listeners to project buttons
    projectsGrid.querySelectorAll('.view-project').forEach(button => {
        button.addEventListener('click', () => viewProject(button.dataset.id));
    });
    
    if (gridId === 'user-projects-grid') {
        projectsGrid.querySelectorAll('.edit-project').forEach(button => {
            button.addEventListener('click', () => editProject(button.dataset.id));
        });
        
        projectsGrid.querySelectorAll('.delete-project').forEach(button => {
            button.addEventListener('click', () => deleteProject(button.dataset.id));
        });
    }
}

// View project details
function viewProject(projectId) {
    // Find the project in either user projects or shared projects
    const project = [...userProjects, ...sharedProjects].find(p => p.id === projectId);
    
    if (!project) {
        showToast('Project not found.', 'error');
        return;
    }
    
    // Populate the code viewer
    document.getElementById('viewer-title').textContent = project.name;
    document.getElementById('viewer-category').textContent = project.category;
    document.getElementById('viewer-version').textContent = project.version;
    document.getElementById('viewer-date').textContent = new Date(project.createdAt).toLocaleDateString();
    
    // Set code content
    const frontendCode = document.getElementById('viewer-frontend-code');
    frontendCode.textContent = project.frontendCode || '// No frontend code';
    frontendCode.className = 'language-html';
    
    const backendCode = document.getElementById('viewer-backend-code');
    backendCode.textContent = project.backendCode || '// No backend code';
    backendCode.className = 'language-javascript';
    
    // Set remarks and URL
    document.getElementById('viewer-remarks').textContent = project.remarks || 'No remarks';
    
    const urlElement = document.getElementById('viewer-url');
    if (project.url) {
        urlElement.href = project.url;
        urlElement.textContent = project.url;
        urlElement.parentElement.classList.remove('hidden');
    } else {
        urlElement.href = '#';
        urlElement.textContent = 'No URL provided';
        urlElement.parentElement.classList.add('hidden');
    }
    
    // Show the code viewer
    document.getElementById('code-viewer').classList.remove('hidden');
    
    // Highlight code syntax
    Prism.highlightAll();
}

// Switch between tabs
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // New project button
    document.getElementById('new-project-btn').addEventListener('click', () => {
        showProjectForm();
    });
    
    // Close viewer button
    document.getElementById('close-viewer-btn').addEventListener('click', () => {
        document.getElementById('code-viewer').classList.add('hidden');
    });
    
    // Code tabs in viewer
    document.querySelectorAll('.code-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.code-tab').forEach(t => {
                t.classList.toggle('active', t === tab);
            });
            
            // Show corresponding panel
            const panelId = tab.dataset.tab + '-panel';
            document.querySelectorAll('.code-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === panelId);
            });
        });
    });
});
