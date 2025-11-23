const { getAuth, onAuthStateChanged } = require("firebase/auth");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const { parseXLSX } = require("../utils/xlsxParser");
const { initializeApp } = require("firebase/app");
const firebaseConfig = require("../../.env").firebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("upload-form");
    const fileInput = document.getElementById("file-input");
    const userInfo = document.getElementById("user-info");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            userInfo.textContent = `Logged in as: ${user.email}`;
        } else {
            window.location.href = "login.html";
        }
    });

    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (file) {
            const data = await parseXLSX(file);
            try {
                const docRef = await addDoc(collection(db, "uploads"), data);
                alert("File uploaded successfully with ID: " + docRef.id);
            } catch (error) {
                console.error("Error adding document: ", error);
                alert("Error uploading file.");
            }
        } else {
            alert("Please select a file to upload.");
        }
    });
});