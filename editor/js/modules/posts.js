// Posts Management Module
import { github } from '../services/github.js';
import { markdownConverter } from '../utils/markdown.js';
import { showToast } from '../ui/toast.js';
import { setButtonLoading, setButtonSuccess, setButtonError } from '../ui/button-states.js';

export class PostsManager {
    constructor() {
        this.allPosts = [];
        this.currentPostSha = null;
        this.currentPostFilename = null;
        this.githubConfig = null;

        // Listen for GitHub config
        window.addEventListener('github-config-loaded', (e) => {
            this.githubConfig = e.detail;
        });

        // Expose globally
        window.publishCurrentPost = () => this.publish();
        window.openLoadModal = () => this.openLoadModal();
        window.closeLoadModal = () => this.closeLoadModal();
        window.filterPosts = () => this.filterPosts();
    }

    validatePost() {
        const title = document.getElementById('post-title')?.value.trim() || '';
        const desc = document.getElementById('post-desc')?.value.trim() || '';
        const heroImage = document.getElementById('post-hero')?.value.trim() || '';
        const content = tinymce.activeEditor ? tinymce.activeEditor.getContent() : '';
        const tags = window.tags || [];
        const errors = [];

        if (!title || title.length < 10) {
            errors.push('❌ El título debe tener al menos 10 caracteres');
        }

        if (title.length > 70) {
            errors.push('⚠️ El título es muy largo (máx 70 caracteres para SEO)');
        }

        if (!desc || desc.length < 50) {
            errors.push('❌ La descripción debe tener al menos 50 caracteres');
        }

        if (desc.length > 160) {
            errors.push('⚠️ La descripción es muy larga (máx 160 para SEO)');
        }

        if (tags.length === 0) {
            errors.push('❌ Agrega al menos un tag');
        }

        if (!heroImage) {
            errors.push('❌ Agrega una imagen principal');
        }

        if (!content || content.length < 100) {
            errors.push('❌ El contenido es muy corto (mínimo 100 caracteres)');
        }

        return errors;
    }

    async publish() {
        // Validate
        const errors = this.validatePost();
        if (errors.length > 0) {
            alert(errors.join('\\n\\n'));
            return;
        }

        const btn = document.querySelector('button[onclick="publishCurrentPost()"]');
        if (!btn) return;

        setButtonLoading(btn, 'Publicando...');

        try {
            const rawContent = tinymce.activeEditor.getContent();
            const mdContent = markdownConverter.htmlToMarkdown(rawContent);

            const title = document.getElementById('post-title').value;
            const desc = document.getElementById('post-desc').value;
            const date = document.getElementById('post-date').value;
            const author = document.getElementById('post-author').value;
            const heroImage = document.getElementById('post-hero').value;
            const flightDest = document.getElementById('flight-dest')?.value || '';
            const tourCity = document.getElementById('tour-city')?.value || '';
            const tags = window.tags || [];

            // Build frontmatter
            let frontmatter = `---
title: "${title}"
description: "${desc}"
publishDate: "${date}"
author: "${author}"
heroImage: "${heroImage}"
layout: "../../layouts/BlogPost.astro"
tags: [${tags.map(x => `"${x}"`).join(', ')}]`;

            if (flightDest) frontmatter += `\nflight_destination: "${flightDest}"`;
            if (tourCity) frontmatter += `\ntour_city: "${tourCity}"`;

            frontmatter += `\n---\n\n`;

            const finalFile = frontmatter + mdContent;

            // Determine filename
            let filename = this.currentPostFilename;
            if (!filename) {
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                filename = `${date}-${slug}.md`;
            }

            // Prepare payload
            const content = github.encodeContent(finalFile);
            const payload = {
                message: `Update ${filename}`,
                content,
                branch: this.githubConfig.branch
            };

            if (this.currentPostSha) {
                payload.sha = this.currentPostSha;
            }

            // Publish
            const response = await github.fetch(`/contents/${this.githubConfig.postsPath}${filename}`, 'PUT', payload);

            this.currentPostSha = response.content.sha;
            this.currentPostFilename = filename;

            setButtonSuccess(btn, '✓ Publicado');
            showToast("✅ Publicado con éxito", "success");

        } catch (error) {
            console.error('Error publishing post:', error);
            setButtonError(btn, '✗ Error');
            showToast("Error: " + error.message, "error");
        }
    }

    async openLoadModal() {
        const modal = document.getElementById('load-post-modal');
        if (modal) {
            modal.classList.add('open');
        }

        try {
            const files = await github.fetch(`/contents/${this.githubConfig.postsPath}`);
            this.allPosts = files.filter(f => f.name.endsWith('.md')).map(f => ({
                name: f.name,
                sha: f.sha
            }));
            this.renderPostsList(this.allPosts);
        } catch (error) {
            console.error('Error loading posts:', error);
            showToast("Error cargando posts", "error");
        }
    }

    closeLoadModal() {
        const modal = document.getElementById('load-post-modal');
        if (modal) {
            modal.classList.remove('open');
        }
    }

    renderPostsList(posts) {
        const container = document.getElementById('posts-list');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-center py-4">No hay posts</p>';
            return;
        }

        container.innerHTML = posts.map(p => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors" onclick="postsManager.loadPost('${p.name}', '${p.sha}')">
                <span class="text-sm font-medium">${p.name}</span>
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </div>
        `).join('');
    }

    filterPosts() {
        const query = document.getElementById('search-posts')?.value.toLowerCase() || '';
        if (!query) {
            this.renderPostsList(this.allPosts);
            return;
        }

        const filtered = this.allPosts.filter(p => p.name.toLowerCase().includes(query));
        this.renderPostsList(filtered);
    }

    async loadPost(filename, sha) {
        try {
            const data = await github.getFile(`${this.githubConfig.postsPath}${filename}`);
            const content = github.decodeContent(data.content);

            // Parse frontmatter and content
            const parts = content.split('---');
            if (parts.length < 3) {
                throw new Error('Invalid post format');
            }

            const frontmatter = parts[1];
            const markdown = parts.slice(2).join('---').trim();

            // Extract frontmatter fields
            const getField = (key) => {
                const match = frontmatter.match(new RegExp(`${key}:\\s*["'](.+?)["']`));
                return match ? match[1] : '';
            };

            const getTags = () => {
                const match = frontmatter.match(/tags:\s*\[(.+?)\]/);
                if (!match) return [];
                return match[1].split(',').map(t => t.trim().replace(/["']/g, ''));
            };

            // Fill form
            document.getElementById('post-title').value = getField('title');
            document.getElementById('post-desc').value = getField('description');
            document.getElementById('post-date').value = getField('publishDate');
            document.getElementById('post-author').value = getField('author');
            document.getElementById('post-hero').value = getField('heroImage');
            document.getElementById('flight-dest').value = getField('flight_destination');
            document.getElementById('tour-city').value = getField('tour_city');

            // Set tags
            window.tags = getTags();
            if (window.renderTags) {
                window.renderTags();
            }

            // Convert markdown to HTML and set in TinyMCE
            const html = marked.parse(markdown);
            if (tinymce.activeEditor) {
                tinymce.activeEditor.setContent(html);
            }

            // Store current post info
            this.currentPostFilename = filename;
            this.currentPostSha = sha;

            // Update preview
            if (window.renderLivePreview) {
                window.renderLivePreview();
            }

            // Close modal
            this.closeLoadModal();

            showToast(`Post "${filename}" cargado`, "success");

        } catch (error) {
            console.error('Error loading post:', error);
            showToast("Error cargando post: " + error.message, "error");
        }
    }
}

// Create singleton instance
export const postsManager = new PostsManager();

// Expose globally
window.postsManager = postsManager;
