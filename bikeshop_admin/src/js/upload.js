const { getFirestore, collection, addDoc } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");
import { parseXLSX } from "../utils/xlsxParser";

const db = getFirestore();
const auth = getAuth();

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        try {
            const data = await parseXLSX(file);
            const user = auth.currentUser;

            if (user) {
                const docRef = await addDoc(collection(db, "uploads"), {
                    userId: user.uid,
                    data: data,
                    timestamp: new Date()
                });
                console.log("Document written with ID: ", docRef.id);
                alert("File uploaded successfully!");
            } else {
                alert("User not authenticated. Please log in.");
            }
        } catch (error) {
            console.error("Error uploading file: ", error);
            alert("Error uploading file. Please try again.");
        }
    } else {
        alert("Please upload a valid XLSX file.");
    }
});