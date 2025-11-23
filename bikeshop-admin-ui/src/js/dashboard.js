// dashboard.js

import { getFirestore, collection, addDoc } from "firebase/firestore"; 
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { parseXLSX } from "../utils/xlsxParser"; 

const db = getFirestore();
const auth = getAuth();

export const renderDashboard = () => {
    const dashboardContainer = document.getElementById('dashboard');
    dashboardContainer.innerHTML = `
        <h1>Dashboard</h1>
        <div id="upload-section">
            <h2>Upload XLSX File</h2>
            <input type="file" id="file-input" accept=".xlsx" />
            <button id="upload-button">Upload</button>
        </div>
        <div id="user-info"></div>
    `;

    const uploadButton = document.getElementById('upload-button');
    uploadButton.addEventListener('click', handleFileUpload);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById('user-info').innerText = `Logged in as: ${user.email}`;
        } else {
            document.getElementById('user-info').innerText = 'Not logged in';
        }
    });
};

const handleFileUpload = async () => {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (file) {
        const data = await parseXLSX(file);
        await uploadDataToFirestore(data);
    } else {
        alert('Please select a file to upload.');
    }
};

const uploadDataToFirestore = async (data) => {
    try {
        const docRef = await addDoc(collection(db, "your-collection-name"), data);
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};