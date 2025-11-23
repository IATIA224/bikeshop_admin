import { uploadFile } from '../src/js/upload';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAOMSUmgAy50p7UA8JSGATUpHZrC-vG81o",
  authDomain: "bikeshop-5538b.firebaseapp.com",
  projectId: "bikeshop-5538b",
  storageBucket: "bikeshop-5538b.firebasestorage.app",
  messagingSenderId: "856565983628",
  appId: "1:856565983628:web:231f23c25865cc22f48ea9",
  measurementId: "G-B00VPZJVFY"
};

initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage();

describe('Upload functionality', () => {
  it('should upload an XLSX file and save data to Firestore', async () => {
    const file = new Blob(['dummy data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = 'test.xlsx';
    const fileRef = ref(storage, fileName);

    await uploadBytes(fileRef, file);
    
    const data = { name: 'Test', value: 'Dummy' }; // Example data to save
    const docRef = await addDoc(collection(db, 'uploads'), data);
    
    expect(docRef.id).toBeDefined();
  });
});