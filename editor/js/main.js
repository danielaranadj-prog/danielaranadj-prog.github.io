// Main Entry Point for Editor
import { initTheme } from './ui/theme.js';
import './config/firebase.js';
import './ui/toast.js';
import './core/auth.js';
import './services/github.js';
import './services/tiptap.js'; // ← Changed from tinymce.js
import './utils/markdown.js';
import './utils/image-upload.js';
import './utils/autosave.js';
import './ui/skeleton.js';
import './ui/button-states.js';
import './modules/preview.js';
import './modules/editor.js';
import './modules/posts.js';
import './modules/authors.js';
import './utils/tiptap-helpers.js';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    console.log('✅ Editor V6.4 with Tiptap loaded');
    console.log('💡 Tip: Press Ctrl+S to save, Esc to close modals');
    console.log('⚡ Auto-save enabled for forms');
});

// Note: Most initialization happens in auth.js when user logs in
// TinyMCE, authors, and posts are loaded after GitHub config is available
