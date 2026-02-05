// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBdsu65Voj8en9u_7eL5q0YRFuCC7fUYWA",
    authDomain: "instantetrips-editor.firebaseapp.com",
    projectId: "instantetrips-editor",
    storageBucket: "instantetrips-editor.firebasestorage.app",
    messagingSenderId: "281917140804",
    appId: "1:281917140804:web:ed712e65c9c4b77dd3b111"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Expose Firestore functions globally for legacy compatibility
window.firestoreDB = db;
window.firestoreDoc = doc;
window.firestoreGetDoc = getDoc;

// Constants
export const MASTER_ADMIN_EMAIL = "danielaranadj@gmail.com";

// Email → Author mapping
export const EMAIL_TO_AUTHOR = {
    'danielaranadj@gmail.com': { slug: 'daniel-arana', name: 'Daniel', role: 'Administrador' },
    // Add more authors: 'email@example.com': { slug: 'author-slug', name: 'Display Name', role: 'Role' }
};

// Helper functions
export const isAdmin = () => auth.currentUser && auth.currentUser.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
export const canDelete = isAdmin;  // Alias for backwards compatibility

export function getCurrentAuthorInfo() {
    if (!auth.currentUser) return null;
    const email = auth.currentUser.email.toLowerCase();
    return EMAIL_TO_AUTHOR[email] || { slug: null, name: auth.currentUser.email.split('@')[0], role: 'Autor' };
}

export function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Buenos días', emoji: '☀️' };
    if (hour >= 12 && hour < 19) return { text: 'Buenas tardes', emoji: '🌤️' };
    return { text: 'Buenas noches', emoji: '🌙' };
}
