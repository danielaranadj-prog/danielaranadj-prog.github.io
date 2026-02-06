// Authentication Module
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db, isAdmin, getCurrentAuthorInfo, getGreeting } from '../config/firebase.js';
import { showToast } from '../ui/toast.js';

export class AuthManager {
    constructor() {
        this.githubConfig = null;
        this.setupLoginForm();
        this.setupAuthListener();
        this.setupLogoutButton();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                // Success handled by onAuthStateChanged listener
            } catch (error) {
                console.error('Login error:', error);
                const errorEl = document.getElementById('login-error');
                if (errorEl) {
                    errorEl.classList.remove('hidden');
                    errorEl.textContent = "Login fallido - Verifica tus credenciales";
                }
                showToast("Error de autenticación", "error");
            }
        });
    }

    setupLogoutButton() {
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    setupAuthListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                await this.onLogin(user);
            } else {
                this.onLogout();
            }
        });
    }

    async onLogin(user) {
        // Hide login, show app
        const loginSection = document.getElementById('login-section');
        const appSection = document.getElementById('app-section');
        if (loginSection) loginSection.classList.add('hidden');
        if (appSection) appSection.classList.remove('hidden');

        // Set default date
        const dateInput = document.getElementById('post-date');
        if (dateInput) dateInput.valueAsDate = new Date();

        // Show admin button only for master admin
        const adminLink = document.getElementById('admin-link');
        if (adminLink) {
            if (isAdmin()) {
                adminLink.classList.remove('hidden');
            } else {
                adminLink.classList.add('hidden');
            }
        }

        // Show personalized greeting
        this.showGreeting();

        // Load GitHub config from Firestore
        try {
            const docSnap = await getDoc(doc(db, "config", "main"));
            if (docSnap.exists()) {
                this.githubConfig = docSnap.data();
                if (!this.githubConfig.postsPath.endsWith('/')) {
                    this.githubConfig.postsPath += '/';
                }
                window.githubConfig = this.githubConfig; // Expose globally

                // Trigger initialization events
                window.dispatchEvent(new CustomEvent('github-config-loaded', { detail: this.githubConfig }));
            }
        } catch (error) {
            console.error('Error loading GitHub config:', error);
            showToast("Error cargando configuración", "error");
        }
    }

    onLogout() {
        const loginSection = document.getElementById('login-section');
        const appSection = document.getElementById('app-section');
        const adminLink = document.getElementById('admin-link');

        if (loginSection) loginSection.classList.remove('hidden');
        if (appSection) appSection.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
    }

    showGreeting() {
        const authorInfo = getCurrentAuthorInfo();
        if (!authorInfo) return;

        const greeting = getGreeting();
        const container = document.getElementById('greeting-container');
        const emojiEl = document.getElementById('greeting-emoji');
        const textEl = document.getElementById('greeting-text');
        const roleEl = document.getElementById('author-role-text');

        if (!container || !emojiEl || !textEl || !roleEl) return;

        emojiEl.textContent = greeting.emoji;
        textEl.textContent = `${greeting.text}, ${authorInfo.name}`;
        roleEl.textContent = authorInfo.role;
        container.classList.remove('hidden');
        container.classList.add('flex');
    }

    logout() {
        signOut(auth);
    }
}

// Create singleton instance
export const authManager = new AuthManager();

// Expose globally for onclick handlers
window.logout = () => authManager.logout();
