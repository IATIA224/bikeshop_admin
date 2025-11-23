# Bikeshop Admin UI

## Overview
The Bikeshop Admin UI is a web application designed for managing the admin side of a bike shop. It features Firebase authentication for secure login and a dashboard for uploading XLSX files to Firestore.

## Features
- User authentication using Firebase
- Dashboard for displaying user-specific data
- File upload functionality for XLSX files
- Responsive design with modern UI components

## Project Structure
```
bikeshop-admin-ui
├── public
│   └── index.html          # Main HTML entry point
├── src
│   ├── js
│   │   ├── app.js          # Application initialization and state management
│   │   ├── auth.js         # Firebase authentication functions
│   │   ├── dashboard.js     # Dashboard management
│   │   ├── upload.js        # File upload functionality
│   │   └── firebaseConfig.js # Firebase configuration
│   ├── css
│   │   └── styles.css       # Application styles
│   ├── components
│   │   ├── LoginForm.js     # Login form component
│   │   ├── DashboardView.js  # Dashboard view component
│   │   └── UploadForm.js     # Upload form component
│   └── utils
│       └── xlsxParser.js     # XLSX file parsing utilities
├── tests
│   └── auth.test.js         # Unit tests for authentication
├── .gitignore                # Git ignore file
├── package.json              # NPM configuration
├── firebase.json             # Firebase hosting configuration
├── firestore.rules           # Firestore security rules
└── README.md                 # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd bikeshop-admin-ui
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Set up Firebase:
   - Create a Firebase project in the Firebase console.
   - Add your Firebase configuration to `src/js/firebaseConfig.js`.
5. Run the application:
   ```
   npm start
   ```

## Usage
- Navigate to the login page to authenticate users.
- Once logged in, users can access the dashboard to upload XLSX files.
- The uploaded files will be processed and stored in Firestore.

## License
This project is licensed under the MIT License.