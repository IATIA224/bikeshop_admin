import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { auth } from '../js/firebaseConfig';

const DashboardView = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const db = getFirestore();
                const userCollection = collection(db, 'users');
                const userDocs = await getDocs(userCollection);
                const userDataArray = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserData(userDataArray);
            }
            setLoading(false);
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            {userData ? (
                <ul>
                    {userData.map(user => (
                        <li key={user.id}>{user.name}</li>
                    ))}
                </ul>
            ) : (
                <p>No user data available.</p>
            )}
        </div>
    );
};

export default DashboardView;