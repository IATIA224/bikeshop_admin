// File: /bikeshop-admin-ui/bikeshop-admin-ui/src/js/upload.js

import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import * as XLSX from 'xlsx';

const db = getFirestore();
const auth = getAuth();

export const uploadFile = async (file) => {
    if (!file) {
        throw new Error("No file provided");
    }

    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        try {
            const docRef = await addDoc(collection(db, "uploads"), {
                userId: user.uid,
                data: jsonData,
                timestamp: new Date()
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    reader.readAsArrayBuffer(file);
};