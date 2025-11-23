// src/js/auth.js

import { auth } from './firebaseConfig';

export const signIn = async (email, password) => {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const checkAuthStatus = (callback) => {
    auth.onAuthStateChanged((user) => {
        callback(user);
    });
};