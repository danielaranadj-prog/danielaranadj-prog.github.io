// Live Preview Module
export class PreviewManager {
    constructor() {
        this.setupPreview();
    }

    setupPreview() {
        // Expose render function globally
        window.renderLivePreview = () => this.render();
        window.openMobilePreview = () => this.openMobile();
        window.closeMobilePreview = () => this.closeMobile();
    }

    render() {
        let content = '';

        // Get content from Tiptap
        if (window.tiptapService?.editor) {
            content = window.tiptapService.getHTML();
        }

        const title = document.getElementById('post-title')?.value || '';
        const heroImage = document.getElementById('post-hero')?.value || '';

        let finalHtml = '';

        // Add hero image if exists
        if (heroImage) {
            finalHtml += `<img src="${heroImage}" class="w-full h-64 object-cover rounded-xl mb-6 shadow-sm">`;
        }

        // Add title if exists
        if (title) {
            finalHtml += `<h1 class="text-3xl font-bold mb-4">${title}</h1>`;
        }

        // Add content
        finalHtml += content;

        // Update desktop preview
        const deskPreview = document.getElementById('live-preview-content');
        if (deskPreview) {
            deskPreview.innerHTML = finalHtml;
        }

        // Update mobile preview
        const mobPreview = document.getElementById('mobile-preview-content');
        if (mobPreview) {
            mobPreview.innerHTML = finalHtml;
        }
    }

    openMobile() {
        this.render();
        const modal = document.getElementById('preview-modal-mobile');
        if (modal) {
            modal.classList.add('open');
        }
    }

    closeMobile() {
        const modal = document.getElementById('preview-modal-mobile');
        if (modal) {
            modal.classList.remove('open');
        }
    }
}

// Create singleton instance
export const previewManager = new PreviewManager();

// Expose globally
window.previewManager = previewManager;
