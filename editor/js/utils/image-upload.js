// Image Upload Utility
// Handles image compression and upload to GitHub

export class ImageUploader {
    constructor() {
        this.githubConfig = null;

        // Listen for GitHub config
        window.addEventListener('github-config-loaded', (e) => {
            this.githubConfig = e.detail;
        });
    }

    async toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async compressImage(file, options = {}) {
        const defaultOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };

        return imageCompression(file, { ...defaultOptions, ...options });
    }

    async uploadToGitHub(file, path) {
        if (!this.githubConfig) {
            throw new Error('GitHub config not loaded');
        }

        // Compress image
        const compressed = await this.compressImage(file);

        // Convert to base64
        const base64 = await this.toBase64(compressed);
        const base64Content = base64.split(',')[1]; // Remove data:image/... prefix

        // Upload to GitHub
        const endpoint = `/contents/${path}`;
        const response = await window.ghFetch(endpoint, 'PUT', {
            message: `Upload image: ${file.name}`,
            content: base64Content,
            branch: this.githubConfig.branch
        });

        return response;
    }

    async uploadHeroImage(file) {
        if (!file) return null;

        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-z0-9]/gi, '-');
        const filename = `${timestamp}-${sanitizedName}`;
        const path = `public/uploads/${filename}`;

        await this.uploadToGitHub(file, path);

        return `/uploads/${filename}`;
    }

    async uploadInlineImage(file) {
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-z0-9]/gi, '-');
        const filename = `${timestamp}-${sanitizedName}`;
        const path = `public/uploads/${filename}`;

        await this.uploadToGitHub(file, path);

        return `/uploads/${filename}`;
    }
}

// Create singleton instance
export const imageUploader = new ImageUploader();

// Expose globally for legacy compatibility
window.imageUploader = imageUploader;

// Global helper function for hero image upload
window.uploadHeroImage = async function (input) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const heroInput = document.getElementById('post-hero');

    if (!heroInput) return;

    try {
        const url = await imageUploader.uploadHeroImage(file);
        heroInput.value = url;

        // Trigger preview update
        if (window.renderLivePreview) {
            window.renderLivePreview();
        }

        if (window.showToast) {
            window.showToast('Imagen subida correctamente', 'success');
        }
    } catch (error) {
        console.error('Error uploading hero image:', error);
        if (window.showToast) {
            window.showToast('Error subiendo imagen: ' + error.message, 'error');
        }
    }
};
