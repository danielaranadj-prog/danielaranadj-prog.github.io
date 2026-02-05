// Editor Metadata Management Module
// Handles tags, SEO validation, and metadata

export class EditorManager {
    constructor() {
        this.tags = [];
        this.setupEventListeners();

        // Expose globally
        window.tags = this.tags;
        window.addTag = (tag) => this.addTag(tag);
        window.removeTag = (tag) => this.removeTag(tag);
        window.renderTags = () => this.renderTags();
        window.updateSEO = () => this.updateSEO();
        window.clearAll = () => this.clearAll();
    }

    setupEventListeners() {
        // Tag input
        const tagInput = document.getElementById('tag-input');
        if (tagInput) {
            tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const tag = tagInput.value.trim();
                    if (tag) {
                        this.addTag(tag);
                        tagInput.value = '';
                    }
                }
            });
        }

        // Title and description for SEO
        const titleInput = document.getElementById('post-title');
        const descInput = document.getElementById('post-desc');

        if (titleInput) {
            titleInput.addEventListener('input', () => this.updateSEO());
        }

        if (descInput) {
            descInput.addEventListener('input', () => this.updateSEO());
        }
    }

    addTag(tag) {
        const sanitized = tag.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (sanitized && !this.tags.includes(sanitized)) {
            this.tags.push(sanitized);
            window.tags = this.tags; // Keep global in sync
            this.renderTags();
        }
    }

    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        window.tags = this.tags; // Keep global in sync
        this.renderTags();
    }

    renderTags() {
        const container = document.getElementById('tags-container');
        if (!container) return;

        if (this.tags.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.tags.map(tag => `
            <span class="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
                #${tag}
                <button onclick="removeTag('${tag}')" class="hover:text-orange-800 dark:hover:text-orange-200">
                    <ion-icon name="close-outline"></ion-icon>
                </button>
            </span>
        `).join('');
    }

    updateSEO() {
        const title = document.getElementById('post-title')?.value || '';
        const desc = document.getElementById('post-desc')?.value || '';

        // Update title count
        const titleCount = document.getElementById('title-count');
        if (titleCount) {
            titleCount.textContent = title.length;
        }

        // Update title SEO indicator
        const titleSeo = document.getElementById('title-seo');
        if (titleSeo) {
            titleSeo.className = 'dot';
            if (title.length === 0) {
                titleSeo.classList.add('bg-gray-200');
            } else if (title.length < 30 || title.length > 70) {
                titleSeo.classList.add('dot-red');
            } else if (title.length < 40 || title.length > 60) {
                titleSeo.classList.add('dot-yellow');
            } else {
                titleSeo.classList.add('dot-green');
            }
        }

        // Update description count (if you add a counter element)
        // Similar logic for description SEO validation
    }

    clearAll() {
        if (!confirm('¿Limpiar todo el formulario?')) return;

        // Clear form fields
        document.getElementById('post-title').value = '';
        document.getElementById('post-desc').value = '';
        document.getElementById('post-date').valueAsDate = new Date();
        document.getElementById('post-hero').value = '';
        document.getElementById('flight-dest').value = '';
        document.getElementById('tour-city').value = '';

        // Clear tags
        this.tags = [];
        window.tags = [];
        this.renderTags();

        // Clear TinyMCE
        if (tinymce.activeEditor) {
            tinymce.activeEditor.setContent('');
        }

        // Clear preview
        if (window.renderLivePreview) {
            window.renderLivePreview();
        }

        // Reset post tracking
        if (window.postsManager) {
            window.postsManager.currentPostFilename = null;
            window.postsManager.currentPostSha = null;
        }

        // Update SEO
        this.updateSEO();

        if (window.showToast) {
            window.showToast('Formulario limpiado', 'info');
        }
    }
}

// Create singleton instance
export const editorManager = new EditorManager();

// Expose globally
window.editorManager = editorManager;
