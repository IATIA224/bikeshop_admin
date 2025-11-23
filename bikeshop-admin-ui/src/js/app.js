// src/js/app.js

import { signIn, signOut, checkAuthStatus } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { uploadXLSX } from './upload.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const uploadButton = document.getElementById('upload-button');

    checkAuthStatus().then(user => {
        if (user) {
            renderDashboard(user);
            logoutButton.style.display = 'block';
            uploadButton.style.display = 'block';
        } else {
            loginButton.style.display = 'block';
        }
    });

    loginButton.addEventListener('click', () => {
        signIn();
    });

    logoutButton.addEventListener('click', () => {
        signOut();
    });

    uploadButton.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadXLSX(file);
        }
    });
});