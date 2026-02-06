// GitHub API Service
export class GitHubService {
    constructor() {
        this.config = null;
    }

    setConfig(config) {
        this.config = config;
    }

    async fetch(endpoint, method = 'GET', body = null) {
        if (!this.config) {
            throw new Error('GitHub config not initialized. Please login first.');
        }

        const options = {
            method,
            headers: {
                'Authorization': `token ${this.config.githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const url = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}${endpoint}`;
        const response = await fetch(url, options);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${error}`);
        }

        return response.json();
    }

    async getFile(path) {
        return this.fetch(`/contents/${path}`);
    }

    async getFiles(path) {
        return this.fetch(`/contents/${path}`);
    }

    async createFile(path, message, content) {
        return this.fetch(`/contents/${path}`, 'PUT', {
            message,
            content,
            branch: this.config.branch
        });
    }

    async updateFile(path, message, content, sha) {
        return this.fetch(`/contents/${path}`, 'PUT', {
            message,
            content,
            sha,
            branch: this.config.branch
        });
    }

    async deleteFile(path, message, sha) {
        return this.fetch(`/contents/${path}`, 'DELETE', {
            message,
            sha,
            branch: this.config.branch
        });
    }

    decodeContent(base64Content) {
        return decodeURIComponent(escape(atob(base64Content)));
    }

    encodeContent(content) {
        return btoa(unescape(encodeURIComponent(content)));
    }
}

// Create singleton instance
export const github = new GitHubService();

// Expose globally for legacy compatibility
window.github = github;
window.ghFetch = (endpoint, method, body) => github.fetch(endpoint, method, body);

// Listen for config loaded event
window.addEventListener('github-config-loaded', (e) => {
    github.setConfig(e.detail);
});
