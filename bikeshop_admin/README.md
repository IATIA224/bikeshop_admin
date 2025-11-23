# Bikeshop Admin

## Overview
Bikeshop Admin is a web application designed for managing bike shop operations. It features user authentication via Firebase and a dashboard for uploading XLSX files to a Firestore database.

## Project Structure
```
bikeshop_admin
├── public
│   ├── index.html          # Main entry point for the application
│   ├── login.html          # User login interface
│   └── dashboard.html      # Dashboard for authenticated users
├── src
│   ├── js
│   │   ├── login.js        # Handles user login functionality
│   │   ├── dashboard.js     # Manages dashboard operations
│   │   ├── upload.js       # Logic for uploading XLSX files
│   │   └── firebase.js     # Initializes Firebase services
│   ├── css
│   │   └── styles.css      # Styles for the application
│   └── utils
│       └── xlsxParser.js   # Utility functions for parsing XLSX files
├── tests
│   └── upload.test.js      # Unit tests for upload functionality
├── .env                     # Firebase configuration details
├── package.json             # npm configuration file
├── vite.config.js          # Build tool configuration
├── firestore.rules          # Firestore security rules
└── README.md                # Project documentation
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd bikeshop_admin
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure Firebase**:
   - Create a Firebase project and obtain your configuration details.
   - Update the `.env` file with your Firebase configuration.

4. **Run the application**:
   ```
   npm run dev
   ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:3000` (or the specified port).

## Usage
- **Login**: Navigate to the login page to authenticate using your email and password.
- **Dashboard**: Once logged in, you can access the dashboard to upload XLSX files. The uploaded data will be saved in Firestore.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.