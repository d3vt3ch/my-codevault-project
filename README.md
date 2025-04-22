# CodeVault - Documentation

## Overview
CodeVault is a web-based application that allows developers to back up their project codes (frontend/backend), manage multiple versions, and optionally share them with others. It's built using vanilla HTML, CSS, and JavaScript for the frontend and Google Sheets (via Apps Script Web App) for the backend.

## Features
- User authentication (registration, login, password reset)
- Project management (create, edit, delete)
- Code storage with syntax highlighting
- Privacy controls (public/private projects)
- Responsive design for desktop and mobile
- Auto-save functionality for drafts

## Technical Stack
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Google Sheets + Google Apps Script
- Syntax Highlighting: Prism.js

## Project Structure
```
CodeVault/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── project.js
│   └── viewer.js
├── lib/
│   ├── prism.css
│   └── prism.js
├── img/
├── index.html
└── google-apps-script.js
```

## Setup Instructions

### 1. Set up Google Sheets Backend
1. Create a new Google Sheet
2. Go to Extensions > Apps Script
3. Copy the contents of `google-apps-script.js` into the Apps Script editor
4. Replace `YOUR_GOOGLE_SHEET_ID` with your actual Google Sheet ID
   - You can find this in the URL of your sheet: `https://docs.google.com/spreadsheets/d/YOUR_GOOGLE_SHEET_ID/edit`
5. Save the script
6. Deploy as a web app:
   - Click "Deploy" > "New deployment"
   - Select type: "Web app"
   - Set "Execute as" to your Google account
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the web app URL for the next step

### 2. Configure Frontend
1. Open `js/app.js`
2. Replace the `BACKEND_URL` value with your deployed Apps Script web app URL:
   ```javascript
   const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec';
   ```

### 3. Deploy the Frontend
You can deploy the frontend in several ways:
- Upload to a web hosting service
- Use GitHub Pages
- Use a static site hosting service like Netlify or Vercel

## User Guide

### Registration and Login
1. Open the application in a web browser
2. Click "Create an account" to register
3. Fill in your name, email, and password
4. After registration, log in with your email and password

### Creating a Project
1. After logging in, click the "New Project" button
2. Fill in the project details:
   - Name: Project name
   - Category: Select from dropdown or add custom
   - Version: e.g., v1.0
   - Frontend Code: Your HTML, CSS, or frontend JavaScript
   - Backend Code: Your backend code
   - Related URL: Link to live project or repository
   - Remarks: Additional notes
   - Privacy: Check "Make Private" to keep it private
3. Click "Save Project"

### Managing Projects
- View all your projects on the dashboard
- Click "Edit" to modify a project
- Click "Delete" to remove a project
- Click "View" to see the code with syntax highlighting

### Viewing Shared Projects
1. Click the "Shared Projects" tab
2. Browse projects shared by other users
3. Click "View" to see the code

## Security Considerations
- Passwords are hashed before storage
- Private projects are only visible to their owners
- Input validation is performed on both client and server sides

## Limitations
- Google Sheets has limits on the amount of data that can be stored
- The free tier of Google Apps Script has quotas on execution time and number of executions
- For large-scale deployment, consider migrating to a more robust backend solution

## Troubleshooting
- If you encounter CORS issues, ensure your Apps Script deployment settings allow access from your frontend domain
- If changes to the backend don't reflect immediately, try clearing your browser cache
- For persistent issues, check the browser console for error messages

## Future Enhancements
- Add search functionality
- Implement tagging system
- Add collaboration features
- Create version history tracking
- Implement direct code execution/preview
