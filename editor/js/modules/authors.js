// Authors Management Module
import { github } from '../services/github.js';
import { showToast } from '../ui/toast.js';
import { getCurrentAuthorInfo, isAdmin } from '../config/firebase.js';

export class AuthorsManager {
    constructor() {
        this.authors = [];
        this.githubConfig = null;

        // Listen for GitHub config
        window.addEventListener('github-config-loaded', (e) => {
            this.githubConfig = e.detail;
            this.loadAuthorsFromRepo();
        });

        // Expose globally
        window.openAuthorModal = () => this.openModal();
        window.closeAuthorModal = () => this.closeModal();
        window.saveNewAuthor = () => this.saveNewAuthor();
    }

    async loadAuthorsFromRepo() {
        if (!this.githubConfig) return;

        try {
            // Load from authors.ts (TypeScript file used by Astro)
            const data = await github.getFile('src/data/authors.ts');
            const content = github.decodeContent(data.content);

            // Parse TypeScript export to extract authors array
            // Format: export const authors = [...]
            const match = content.match(/export\s+const\s+authors\s*=\s*(\[[\s\S]*?\]);/);
            if (match) {
                // Use Function constructor to safely evaluate the array
                this.authors = new Function(`return ${match[1]}`)();
            } else {
                throw new Error('Could not parse authors from .ts file');
            }
        } catch (error) {
            // If authors.ts doesn't exist, use EMAIL_TO_AUTHOR mapping from firebase config
            console.warn('authors.ts not found, using EMAIL_TO_AUTHOR mapping:', error.message);

            // Import EMAIL_TO_AUTHOR from config
            import('../config/firebase.js').then(module => {
                const EMAIL_TO_AUTHOR = module.EMAIL_TO_AUTHOR;

                // Convert EMAIL_TO_AUTHOR object to authors array
                this.authors = Object.values(EMAIL_TO_AUTHOR).filter(author => author.slug);
                this.populateAuthorSelect();
            });
            return;
        }

        this.populateAuthorSelect();
    }

    populateAuthorSelect() {
        const select = document.getElementById('post-author');
        if (!select) return;

        // Get current user info
        const currentAuthor = getCurrentAuthorInfo();

        // Clear existing options
        select.innerHTML = '';

        // Add authors
        this.authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.slug;
            option.textContent = `${author.name} (${author.role})`;
            select.appendChild(option);
        });

        // Auto-select current user's author
        if (currentAuthor && currentAuthor.slug) {
            select.value = currentAuthor.slug;
        }

        // Disable selector for non-admins (they can only post as themselves)
        if (!isAdmin()) {
            select.disabled = true;
            select.classList.add('opacity-60', 'cursor-not-allowed');
            select.title = 'Tu autor está seleccionado automáticamente';
        }
    }

    openModal() {
        const modal = document.getElementById('author-modal');
        if (modal) {
            modal.classList.add('open');
        }
    }

    closeModal() {
        const modal = document.getElementById('author-modal');
        if (modal) {
            modal.classList.remove('open');
        }
    }

    async saveNewAuthor() {
        const name = document.getElementById('author-name')?.value.trim();
        const role = document.getElementById('author-role')?.value.trim();
        const bio = document.getElementById('author-bio')?.value.trim();

        if (!name || !role) {
            showToast("Completa nombre y rol", "error");
            return;
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const newAuthor = {
            slug,
            name,
            role,
            bio: bio || '',
            avatar: '/images/default-avatar.jpg'
        };

        try {
            // Add to authors array
            this.authors.push(newAuthor);

            // Get current file data
            const fileData = await github.getFile('src/data/authors.json');
            const sha = fileData.sha;

            // Update file
            const content = github.encodeContent(JSON.stringify(this.authors, null, 2));
            await github.updateFile(
                'src/data/authors.json',
                `Add author: ${name}`,
                content,
                sha
            );

            // Refresh select
            this.populateAuthorSelect();

            // Clear form
            document.getElementById('author-name').value = '';
            document.getElementById('author-role').value = '';
            document.getElementById('author-bio').value = '';

            // Close modal
            this.closeModal();

            showToast(`Autor "${name}" guardado`, "success");

        } catch (error) {
            console.error('Error saving author:', error);
            showToast("Error guardando autor: " + error.message, "error");
        }
    }
}

// Create singleton instance
export const authorsManager = new AuthorsManager();

// Expose globally
window.authorsManager = authorsManager;
