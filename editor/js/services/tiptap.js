// Tiptap Editor Service - Using CDN imports
import { Editor } from 'https://esm.sh/@tiptap/core@2.1.13';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.1.13';
import Image from 'https://esm.sh/@tiptap/extension-image@2.1.13';
import Link from 'https://esm.sh/@tiptap/extension-link@2.1.13';
import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder@2.1.13';
import Youtube from 'https://esm.sh/@tiptap/extension-youtube@2.1.13';
import { Markdown } from 'https://esm.sh/tiptap-markdown@0.8.2';

export class TiptapService {
    constructor() {
        this.editor = null;
    }

    async init(elementId = 'editor', initialContent = '') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element #${elementId} not found`);
            return null;
        }

        this.editor = new Editor({
            element,
            extensions: [
                StarterKit.configure({
                    heading: {
                        levels: [1, 2, 3, 4]
                    }
                }),
                Image.configure({
                    HTMLAttributes: {
                        class: 'blog-image',
                    },
                }),
                Link.configure({
                    openOnClick: false,
                    HTMLAttributes: {
                        class: 'blog-link',
                        rel: 'noopener noreferrer',
                        target: '_blank',
                    },
                }),
                Placeholder.configure({
                    placeholder: 'Escribe tu contenido aquí... Usa Markdown o el toolbar para dar formato.',
                }),
                Youtube.configure({
                    controls: true,
                    nocookie: true,
                }),
                Markdown.configure({
                    html: true, // Allow HTML in markdown (for CTA cards)
                    breaks: true,
                    linkify: true,
                }),
            ],
            content: initialContent,
            editorProps: {
                attributes: {
                    class: 'prose prose-lg max-w-none focus:outline-none',
                },
            },
            onUpdate: ({ editor }) => {
                // Trigger preview update
                if (window.renderLivePreview) {
                    window.renderLivePreview();
                }
            },
        });

        console.log('✅ Tiptap editor initialized');
        return this.editor;
    }

    getHTML() {
        if (!this.editor) return '';
        return this.editor.getHTML();
    }

    getMarkdown() {
        if (!this.editor) return '';
        return this.editor.storage.markdown.getMarkdown();
    }

    setContent(content) {
        if (!this.editor) return;
        this.editor.commands.setContent(content);
    }

    insertImage(url, alt = '') {
        if (!this.editor) return;
        this.editor.chain().focus().setImage({ src: url, alt }).run();
    }

    insertVideo(url) {
        if (!this.editor) return;

        // Check if it's a YouTube URL
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            this.editor.chain().focus().setYoutubeVideo({ src: url }).run();
        } else {
            // For other videos (TikTok, etc.), insert as raw URL
            this.editor.chain().focus().insertContent(url + '\n\n').run();
        }
    }

    insertCTA(attrs) {
        if (!this.editor) return;

        const { url, emoji, label, title, description } = attrs;

        // Insert CTA as HTML (will be preserved in markdown)
        const ctaHTML = `
<div class="cta-destination-card">
    <a href="${url}" target="_blank" rel="noopener noreferrer">
        <div class="cta-emoji">${emoji}</div>
        <div class="cta-content">
            <span class="cta-label">${label}</span>
            <h3 class="cta-title">${title}</h3>
            <p class="cta-description">${description}</p>
        </div>
    </a>
</div>
        `.trim();

        this.editor.chain().focus().insertContent(ctaHTML).run();
    }

    destroy() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }
}

// Create singleton instance
export const tiptapService = new TiptapService();

// Expose globally for compatibility
window.tiptapService = tiptapService;

// Listen for GitHub config to initialize editor
window.addEventListener('github-config-loaded', () => {
    tiptapService.init();
});
