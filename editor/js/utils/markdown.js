// Markdown Conversion Utility (Turndown)
// Converts HTML to Markdown for GitHub publishing

export class MarkdownConverter {
    constructor() {
        this.turndownService = null;
        this.initTurndown();
    }

    initTurndown() {
        // Initialize Turndown service
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            bulletListMarker: '-'
        });

        // Use GFM plugin for tables, strikethrough, etc.
        this.turndownService.use(turndownPluginGfm.gfm);

        // Custom rule for iframes (YouTube, etc.)
        this.turndownService.addRule('iframe', {
            filter: 'iframe',
            replacement: function (content, node) {
                const src = node.getAttribute('src');
                return src ? '\\n\\n' + src + '\\n\\n' : '';
            }
        });

        // Custom rule for TikTok embeds
        this.turndownService.addRule('tiktok', {
            filter: function (node) {
                return node.nodeName === 'BLOCKQUOTE' && node.classList.contains('tiktok-embed');
            },
            replacement: function (content, node) {
                const cite = node.getAttribute('cite');
                return cite ? '\\n\\n' + cite + '\\n\\n' : '';
            }
        });

        // Custom rule for CTA destination cards (preserve HTML)
        this.turndownService.addRule('cta', {
            filter: function (node) {
                return node.nodeName === 'A' && node.classList.contains('cta-destination-card');
            },
            replacement: function (content, node) {
                return '\\n\\n' + node.outerHTML + '\\n\\n';
            }
        });
    }

    htmlToMarkdown(html) {
        if (!this.turndownService) {
            throw new Error('Turndown service not initialized');
        }
        return this.turndownService.turndown(html);
    }
}

// Create singleton instance
export const markdownConverter = new MarkdownConverter();

// Expose globally for legacy compatibility
window.markdownConverter = markdownConverter;
