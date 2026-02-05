// TinyMCE Service
// Handles TinyMCE initialization and custom buttons

import { imageUploader } from '../utils/image-upload.js';

export class TinyMCEService {
    constructor() {
        this.editor = null;
        this.initialized = false;
    }

    async init(initialContent = '') {
        if (this.initialized) {
            console.warn('TinyMCE already initialized');
            return;
        }

        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        await tinymce.init({
            selector: '#tiny-editor',
            height: 600,
            menubar: false,
            skin: isDark ? 'oxide-dark' : 'oxide',
            content_css: isDark ? 'dark' : 'default',
            plugins: 'image media link lists table code preview wordcount help',
            toolbar: 'undo redo | blocks fontsize | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image media | customCtaBtn customVideoBtn | removeformat code',
            content_style: 'body { font-family:Inter,sans-serif; font-size:16px; line-height:1.6 } img { max-width: 100%; height: auto; border-radius: 8px; }',
            convert_urls: false,
            relative_urls: false,
            remove_script_host: false,
            media_live_embeds: true,
            setup: (editor) => {
                // Store editor reference
                this.editor = editor;

                // Set initial content
                editor.on('init', () => {
                    editor.setContent(initialContent);
                });

                // Listen for content changes
                editor.on('input change keyup', () => {
                    if (window.renderLivePreview) {
                        window.renderLivePreview();
                    }
                });

                // Custom Video Button
                editor.ui.registry.addButton('customVideoBtn', {
                    icon: 'embed',
                    tooltip: 'Insertar Video (YouTube/TikTok)',
                    onAction: () => {
                        this.insertVideoLink(editor);
                    }
                });

                // Custom CTA Button
                editor.ui.registry.addButton('customCtaBtn', {
                    icon: 'bookmark',
                    tooltip: 'Insertar CTA Destino',
                    onAction: () => {
                        this.insertCtaLink(editor);
                    }
                });
            },
            images_upload_handler: async (blobInfo, progress) => {
                try {
                    const file = blobInfo.blob();
                    const url = await imageUploader.uploadInlineImage(file);
                    return url;
                } catch (error) {
                    throw new Error('Error subiendo imagen: ' + error.message);
                }
            }
        });

        this.initialized = true;
    }

    insertVideoLink(editor) {
        const input = prompt('Pega el enlace o código embed (YouTube/TikTok):');
        if (!input || !input.trim()) return;

        let cleanUrl = input.trim();

        // Check if it's HTML embed code
        if (cleanUrl.includes('<iframe') || cleanUrl.includes('<blockquote')) {
            const div = document.createElement('div');
            div.innerHTML = cleanUrl;

            const iframe = div.querySelector('iframe');
            const blockquote = div.querySelector('blockquote');

            if (iframe && iframe.src) {
                cleanUrl = iframe.src;
            } else if (blockquote && blockquote.getAttribute('cite')) {
                cleanUrl = blockquote.getAttribute('cite');
            }
        }

        editor.insertContent(`\\n\\n${cleanUrl}\\n\\n`);
    }

    insertCtaLink(editor) {
        const url = prompt('URL del Destino (Ej: https://.../ushuaia)', 'https://www.instantetrips.com/argentina/destinos/ushuaia/');
        if (!url) return;

        const emoji = prompt('Emoji / Bandera (Ej: 🇦🇷)', '🇦🇷');
        const label = prompt('Etiqueta Pequeña (Ej: Guía de Destino)', 'Guía de Destino');
        const title = prompt('Título Principal (Ej: Ushuaia: El Fin del Mundo)', 'Ushuaia: El Fin del Mundo');
        const desc = prompt('Descripción (Ej: Clima, presupuesto...)', 'Clima, presupuesto, tours y experiencias imperdibles →');

        const html = `
        <a href="${url}" target="_blank" class="cta-destination-card" style="display:block; margin:2.5rem 0; padding:1.75rem; background:linear-gradient(135deg, rgba(244,185,66,0.08), rgba(117,170,219,0.08)); border-radius:16px; border-left:4px solid var(--accent-gold, #F4B942); text-decoration:none; color:inherit;">
          <span style="display:inline-flex; align-items:center; gap:8px; margin-bottom:1rem;">
            <span style="font-size:1.5rem;">${emoji}</span>
            <span style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:var(--brand-blue, #75AADB); background:rgba(117,170,219,0.12); padding:6px 12px; border-radius:20px;">${label}</span>
          </span>
          <br>
          <strong style="font-size:1.4rem; font-weight:800; color:var(--text-main, #2D3748);">${title}</strong>
          <br>
          <span style="color:var(--text-muted, #718096); font-size:0.95rem;">${desc}</span>
        </a>
        <p>&nbsp;</p>
        `;

        editor.insertContent(html);
    }

    getContent() {
        return this.editor ? this.editor.getContent() : '';
    }

    setContent(content) {
        if (this.editor) {
            this.editor.setContent(content);
        }
    }
}

// Create singleton instance
export const tinyMCEService = new TinyMCEService();

// Expose globally for legacy compatibility
window.tinyMCEService = tinyMCEService;
window.insertVideoLink = () => {
    if (tinymce.activeEditor) {
        tinyMCEService.insertVideoLink(tinymce.activeEditor);
    }
};
window.insertCtaLink = () => {
    if (tinymce.activeEditor) {
        tinyMCEService.insertCtaLink(tinymce.activeEditor);
    }
};

// Initialize TinyMCE when GitHub config is loaded
window.addEventListener('github-config-loaded', () => {
    tinyMCEService.init();
});
