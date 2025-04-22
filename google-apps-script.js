// Google Apps Script for CodeVault Backend
// This code should be deployed as a Web App in Google Apps Script

// Global variables
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your actual Google Sheet ID
const USERS_SHEET_NAME = 'Users';
const PROJECTS_SHEET_NAME = 'Projects';

// Main function that handles all requests
function doPost(e) {
  try {
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Set CORS headers for the preflight request
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };
    
    // Handle different actions
    let result;
    switch (action) {
      case 'register':
        result = registerUser(data);
        break;
      case 'login':
        result = loginUser(data);
        break;
      case 'resetPassword':
        result = resetPassword(data);
        break;
      case 'getUserProjects':
        result = getUserProjects(data);
        break;
      case 'getSharedProjects':
        result = getSharedProjects(data);
        break;
      case 'createProject':
        result = createProject(data);
        break;
      case 'updateProject':
        result = updateProject(data);
        break;
      case 'deleteProject':
        result = deleteProject(data);
        break;
      case 'getProject':
        result = getProject(data);
        break;
      default:
        result = { success: false, message: 'Invalid action' };
    }
    
    // Return the result
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (error) {
    // Handle errors
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
  }
}

// Handle preflight OPTIONS requests
function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

// Initialize the spreadsheet if it doesn't exist
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Check if Users sheet exists, create if not
  let usersSheet;
  try {
    usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
    if (!usersSheet) {
      usersSheet = ss.insertSheet(USERS_SHEET_NAME);
      usersSheet.appendRow(['ID', 'Name', 'Email', 'Password', 'CreatedAt']);
    }
  } catch (e) {
    usersSheet = ss.insertSheet(USERS_SHEET_NAME);
    usersSheet.appendRow(['ID', 'Name', 'Email', 'Password', 'CreatedAt']);
  }
  
  // Check if Projects sheet exists, create if not
  let projectsSheet;
  try {
    projectsSheet = ss.getSheetByName(PROJECTS_SHEET_NAME);
    if (!projectsSheet) {
      projectsSheet = ss.insertSheet(PROJECTS_SHEET_NAME);
      projectsSheet.appendRow([
        'ID', 
        'UserID', 
        'Name', 
        'Category', 
        'Version', 
        'Thumbnail', 
        'FrontendCode', 
        'BackendCode', 
        'URL', 
        'Remarks', 
        'IsPrivate', 
        'CreatedAt', 
        'UpdatedAt'
      ]);
    }
  } catch (e) {
    projectsSheet = ss.insertSheet(PROJECTS_SHEET_NAME);
    projectsSheet.appendRow([
      'ID', 
      'UserID', 
      'Name', 
      'Category', 
      'Version', 
      'Thumbnail', 
      'FrontendCode', 
      'BackendCode', 
      'URL', 
      'Remarks', 
      'IsPrivate', 
      'CreatedAt', 
      'UpdatedAt'
    ]);
  }
}

// Helper function to generate a unique ID
function generateUniqueId() {
  return Utilities.getUuid();
}

// Helper function to hash a password
function hashPassword(password) {
  // In a real app, you'd use a proper hashing algorithm
  // For this demo, we'll use a simple hash
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password));
}

// Helper function to find a user by email
function findUserByEmail(email) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  const usersData = usersSheet.getDataRange().getValues();
  
  // Skip header row
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][2] === email) {
      return {
        id: usersData[i][0],
        name: usersData[i][1],
        email: usersData[i][2],
        password: usersData[i][3],
        createdAt: usersData[i][4]
      };
    }
  }
  
  return null;
}

// Helper function to find a user by ID
function findUserById(userId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  const usersData = usersSheet.getDataRange().getValues();
  
  // Skip header row
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === userId) {
      return {
        id: usersData[i][0],
        name: usersData[i][1],
        email: usersData[i][2],
        password: usersData[i][3],
        createdAt: usersData[i][4]
      };
    }
  }
  
  return null;
}

// Helper function to find a project by ID
function findProjectById(projectId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const projectsSheet = ss.getSheetByName(PROJECTS_SHEET_NAME);
  const projectsData = projectsSheet.getDataRange().getValues();
  
  // Skip header row
  for (let i = 1; i < projectsData.length; i++) {
    if (projectsData[i][0] === projectId) {
      return {
        id: projectsData[i][0],
        userId: projectsData[i][1],
        name: projectsData[i][2],
        category: projectsData[i][3],
        version: projectsData[i][4],
        thumbnail: projectsData[i][5],
        frontendCode: projectsData[i][6],
        backendCode: projectsData[i][7],
        url: projectsData[i][8],
        remarks: projectsData[i][9],
        isPrivate: projectsData[i][10] === 'true',
        createdAt: projectsData[i][11],
        updatedAt: projectsData[i][12]
      };
    }
  }
  
  return null;
}

// Register a new user
function registerUser(data) {
  try {
    // Initialize spreadsheet if needed
    initializeSpreadsheet();
    
    const { name, email, password } = data;
    
    // Validate inputs
    if (!name || !email || !password) {
      return { success: false, message: 'Name, email, and password are required' };
    }
    
    // Check if email is already registered
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return { success: false, message: 'Email is already registered' };
    }
    
    // Hash the password
    const hashedPassword = hashPassword(password);
    
    // Generate a unique ID
    const userId = generateUniqueId();
    
    // Get current timestamp
    const createdAt = new Date().toISOString();
    
    // Add user to the sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
    usersSheet.appendRow([userId, name, email, hashedPassword, createdAt]);
    
    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Login a user
function loginUser(data) {
  try {
    const { email, password } = data;
    
    // Validate inputs
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
    
    // Find user by email
    const user = findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Check password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Return user data (excluding password)
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Reset a user's password
function resetPassword(data) {
  try {
    const { email } = data;
    
    // Validate inputs
    if (!email) {
      return { success: false, message: 'Email is required' };
    }
    
    // Find user by email
    const user = findUserByEmail(email);
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return { success: true, message: 'If your email is registered, you will receive reset instructions' };
    }
    
    // In a real app, you would send an email with reset instructions
    // For this demo, we'll just return a success message
    
    return { success: true, message: 'If your email is registered, you will receive reset instructions' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Get a user's projects
function getUserProjects(data) {
  try {
    const { userId } = data;
    
    // Validate inputs
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }
    
    // Find user by ID
    const user = findUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Get projects for the user
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const projectsSheet = ss.getSheetByName(PROJECTS_SHEET_NAME);
    const projectsData = projectsSheet.getDataRange().getValues();
    
    const projects = [];
    
    // Skip header row
    for (let i = 1; i < projectsData.length; i++) {
      if (projectsData[i][1] === userId) {
        projects.push({
          id: projectsData[i][0],
          userId: projectsData[i][1],
          name: projectsData[i][2],
          category: projectsData[i][3],
          version: projectsData[i][4],
          thumbnail: projectsData[i][5],
          frontendCode: projectsData[i][6],
          backendCode: projectsData[i][7],
          url: projectsData[i][8],
          remarks: projectsData[i][9],
          isPrivate: projectsData[i][10] === 'true',
          createdAt: projectsData[i][11],
          updatedAt: projectsData[i][12]
        });
      }
    }
    
    return { success: true, projects };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Get shared projects (public projects from other users)
function getSharedProjects(data) {
  try {
    const { userId } = data;
    
    // Validate inputs
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }
    
    // Get public projects from other users
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const projectsSheet = ss.getSheetByName(PROJECTS_SHEET_NAME);
    const projectsData = projectsSheet.getDataRange().getValues();
    
    const projects = [];
    
    // Skip header row
    for (let i = 1; i < projectsData.length; i++) {
      // Only include public projects from other users
      if (projectsData[i][1] !== userId && projectsData[i][10] !== 'true') {
        projects.push({
          id: projectsData[i][0],
          userId: projectsData[i][1],
          name: projectsData[i][2],
          category: projectsData[i][3],
          version: projectsData[i][4],
          thumbnail: projectsData[i][5],
          frontendCode: projectsData[i][6],
          backendCode: projectsData[i][7],
          url: projectsData[i][8],
          remarks: projectsData[i][9],
          isPrivate: false, // These are all public
          createdAt: projectsData[i][11],
          updatedAt: projectsData[i][12]
        });
      }
    }
    
    return { success: true, projects };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Create a new project
function createProject(data) {
  try {
    // Initialize spreadsheet if needed
    initializeSpreadsheet();
    
    const { project } = data;
    
    // Validate inputs
    if (!project || !project.userId || !project.name || !project.version) {
      return { success: false, message: 'Project data, user ID, name, and version are required' };
    }
    
    // Find user by ID
    const user = findUserById(project.userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Generate a unique ID
    const projectId = generateUniqueId();
    
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Add project to the sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const projectsSheet = ss.getSheetByName(PROJECTS_SHEET_NAME);
    projectsSheet.appendRow([
      projectId,
      project.userId,
      project.name,
      project.category || '',
      project.version,
      project.thumbnail || '',
      project.frontendCode || '',
      project.backendCode || '',
      project.url || '',
      project.remarks || '',
      project.isPrivate ? 'true' : 'false',
      timestamp,
      timestamp
    ]);
    
    return { 
      success: true, 
      message: 'Project created successfully',
      projectId: projectId
    };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Update an existing project
function updateProject(data) {
  try {
    const { project } = data;
    
    // Validate inputs
    if (!project || !project.id || !project.userId || !project.name || !project.version) {
      return { success: false, message: 'Project data, ID, user ID, name, and version are required' };
    }
    
    // Find project by ID
    const existingProject = findProjectById(project.id);
    if (!existingProject) {
      return { success: false, message: 'Project not found' };
    }
    
    // Check if user owns the project
    if (existingProject.userId !== project.userId) {
      return { success: false, message: 'You do not have permission to update this project' };
    }
    
    // Get current timestamp
    const updatedAt = new Date().toISOString();
    
    // Update project in the sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const projectsSheet = ss.getSheetByName(PROJECTS_SHEET_NAME);
    const projectsData = projectsSheet.getDataRange().getValues();
    
    // Find the row index of the project
    let rowIndex = -1;
    for (let i = 1; i < projectsData.length; i++) {
      if (projectsData[i][0] === project.id) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Project not found' };
    }
    
    // Update the row
    projectsSheet.getRange(rowIndex, 3).setValue(project.name);
    projectsSheet.getRange(rowIndex, 4).setValue(project.category || '');
    projectsSheet.getRange(rowIndex, 5).setValue(project.version);
    projectsSheet.getRange(rowIndex, 6).setValue(project.thumbnail || '');
    projectsSheet.getRange(rowIndex, 7).setValue(project.frontendCode || '');
    projectsSheet.getRange(rowIndex, 8).setValue(project.backendCode || '');
    projectsSheet.getRange(rowIndex, 9).setValue(project.url || '');
    projectsSheet.getRange(rowIndex, 10).setValue(project.remarks || '');
    projectsSheet.getRange(rowIndex, 11).setValue(project.isPrivate ? 'true' : 'false');
    projectsSheet.getRange(rowIndex, 13).setValue(updatedAt);
    
    return { success: true, message: 'Project updated successfully' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Delete a project
function deleteProject(data) {
  try {
    const { projectId, userId } = data;
    
    // Validate inputs
    if (!projectId || !userId) {
      return { success: false, message: 'Project ID and user ID are required' };
    }
    
    // Find project by ID
    const project = findProjectById(projectId);
    if (!project) {
      return { success: false, message: 'Project not found' };
    }
    
    // Check if user owns the project
    if (project.userId !== userId) {
      return { success: false, message: 'You do not have permission to delete this project' };
    }
    
    // Delete project from the sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const projectsSheet = ss.getSheetByName(PROJECTS_SHEET_NAME);
    const projectsData = projectsSheet.getDataRange().getValues();
    
    // Find the row index of the project
    let rowIndex = -1;
    for (let i = 1; i < projectsData.length; i++) {
      if (projectsData[i][0] === projectId) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Project not found' };
    }
    
    // Delete the row
    projectsSheet.deleteRow(rowIndex);
    
    return { success: true, message: 'Project deleted successfully' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Get a specific project
function getProject(data) {
  try {
    const { projectId, userId } = data;
    
    // Validate inputs
    if (!projectId) {
      return { success: false, message: 'Project ID is required' };
    }
    
    // Find project by ID
    const project = findProjectById(projectId);
    if (!project) {
      return { success: false, message: 'Project not found' };
    }
    
    // Check if user has permission to view the project
    if (project.isPrivate && project.userId !== userId) {
      return { success: false, message: 'You do not have permission to view this project' };
    }
    
    return { success: true, project };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}
