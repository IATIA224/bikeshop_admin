import React, { useState } from 'react';
import { uploadFileToFirestore } from '../js/upload';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        try {
            await uploadFileToFirestore(file);
            setMessage('File uploaded successfully!');
            setFile(null);
        } catch (error) {
            setMessage('Error uploading file: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Upload XLSX File</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".xlsx" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UploadForm;