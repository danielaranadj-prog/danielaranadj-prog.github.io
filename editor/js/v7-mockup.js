// ========================================
// V7 Mockup - Global Functions
// ========================================

// Toggle Blocks Menu
window.toggleBlocksMenu = function () {
    const menu = document.getElementById('blocks-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
};

// Insert Block
window.insertBlock = function (blockType) {
    console.log(`Inserting block: ${blockType}`);

    // Close the blocks menu
    toggleBlocksMenu();

    // Here you would insert the actual block into Tiptap
    // For now, just a placeholder
    if (window.tiptapService?.editor) {
        let content = '';

        switch (blockType) {
            case 'video':
                content = '<div class="video-block"><p>📹 Video placeholder - Add your video here</p></div>';
                break;
            case 'cta':
                content = '<div class="cta-block"><p>🚀 CTA placeholder</p></div>';
                break;
            case 'gallery':
                content = '<div class="gallery-block"><p>🖼️ Gallery placeholder</p></div>';
                break;
            case 'table':
                window.tiptapService.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                return;
            case 'flights':
                content = '<div class="flights-widget"><p>✈️ Flights widget placeholder</p></div>';
                break;
            case 'faq':
                content = '<div class="faq-block"><p>❓ FAQ placeholder</p></div>';
                break;
            case 'quote':
                window.tiptapService.editor.chain().focus().toggleBlockquote().run();
                return;
            case 'map':
                content = '<div class="map-block"><p>🗺️ Map placeholder</p></div>';
                break;
            case 'proscons':
                content = '<div class="proscons-block"><h3>👍 Pros</h3><ul><li>Pro 1</li></ul><h3>👎 Contras</h3><ul><li>Contra 1</li></ul></div>';
                break;
        }

        window.tiptapService.editor.commands.insertContent(content);
    }
};

// Preview Device Toggle
function setupPreviewToggles() {
    const buttons = document.querySelectorAll('.preview-device-btn');
    const previewContent = document.getElementById('live-preview-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active from all buttons
            buttons.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            this.classList.add('active');

            const device = this.dataset.device;

            // Adjust preview width based on device
            if (previewContent) {
                switch (device) {
                    case 'desktop':
                        previewContent.style.transform = 'scale(1)';
                        previewContent.style.maxWidth = '100%';
                        break;
                    case 'tablet':
                        previewContent.style.transform = 'scale(0.8)';
                        previewContent.style.maxWidth = '768px';
                        break;
                    case 'mobile':
                        previewContent.style.transform = 'scale(0.6)';
                        previewContent.style.maxWidth = '375px';
                        break;
                }
            }
        });
    });
}

// Update Article Title Display
function updateArticleTitleDisplay() {
    const titleInput = document.getElementById('post-title');
    const titleDisplay = document.getElementById('article-title-display');
    const snippetTitle = document.getElementById('snippet-title');

    function syncTitle() {
        const title = titleInput.value || 'Título del Artículo';
        if (titleDisplay) {
            titleDisplay.textContent = title;
        }
        if (snippetTitle) {
            snippetTitle.textContent = title || 'Título del post';
        }
    }

    if (titleInput) {
        titleInput.addEventListener('input', syncTitle);
        syncTitle(); // Initial sync
    }
}

// Update SEO Snippet Description
function updateSEOSnippet() {
    const descInput = document.getElementById('post-desc');
    const snippetDesc = document.getElementById('snippet-description');

    function syncDesc() {
        const desc = descInput.value || 'Descripción SEO del artículo...';
        if (snippetDesc) {
            snippetDesc.textContent = desc;
        }
    }

    if (descInput) {
        descInput.addEventListener('input', syncDesc);
        syncDesc(); // Initial sync
    }
}

// Update Hero Image Display
function updateHeroImageDisplay() {
    const heroInput = document.getElementById('post-hero');
    const heroPreview = document.getElementById('hero-preview');
    const heroPreviewImg = document.getElementById('hero-preview-img');
    const heroDisplay = document.getElementById('hero-display');
    const heroDisplayImg = document.getElementById('hero-display-img');

    function syncHeroImage() {
        const url = heroInput.value;

        if (url) {
            // Update config panel preview
            if (heroPreview && heroPreviewImg) {
                heroPreviewImg.src = url;
                heroPreview.classList.remove('hidden');
            }

            // Update editor display
            if (heroDisplay && heroDisplayImg) {
                heroDisplayImg.src = url;
                heroDisplay.classList.remove('hidden');
            }
        } else {
            // Hide previews if no URL
            if (heroPreview) heroPreview.classList.add('hidden');
            if (heroDisplay) heroDisplay.classList.add('hidden');
        }
    }

    if (heroInput) {
        heroInput.addEventListener('input', syncHeroImage);
        syncHeroImage(); // Initial sync
    }
}

// ========================================
// SEO Analysis Integration
// ========================================

let seoAnalyzer = null;
let seoAnalysisTimeout = null;

function initSEOAnalyzer() {
    if (!window.SEOAnalyzer) {
        console.warn('SEOAnalyzer not loaded');
        return;
    }

    seoAnalyzer = new window.SEOAnalyzer();

    // Setup listeners for SEO analysis
    const titleInput = document.getElementById('post-title');
    const descInput = document.getElementById('post-desc');
    const heroInput = document.getElementById('post-hero');

    const triggerAnalysis = () => {
        // Debounce analysis (wait 500ms after last change)
        clearTimeout(seoAnalysisTimeout);
        seoAnalysisTimeout = setTimeout(runSEOAnalysis, 500);
    };

    if (titleInput) titleInput.addEventListener('input', triggerAnalysis);
    if (descInput) descInput.addEventListener('input', triggerAnalysis);
    if (heroInput) heroInput.addEventListener('input', triggerAnalysis);

    // Also listen to Tiptap editor changes
    if (window.tiptapService?.editor) {
        window.tiptapService.editor.on('update', triggerAnalysis);
    }

    // Run initial analysis
    runSEOAnalysis();
}

function runSEOAnalysis() {
    if (!seoAnalyzer) return;

    const title = document.getElementById('post-title')?.value || '';
    const description = document.getElementById('post-desc')?.value || '';
    const heroImage = document.getElementById('post-hero')?.value || '';
    const content = window.tiptapService?.editor?.storage.markdown.getMarkdown() || '';

    const results = seoAnalyzer.analyze({
        title,
        description,
        content,
        heroImage
    });

    updateSEOUI(results);
}

function updateSEOUI(results) {
    // Update score display - target the correct element ID
    const scoreBadge = document.getElementById('seo-score-badge');
    if (scoreBadge) {
        const scoreValue = scoreBadge.querySelector('.text-6xl');
        const scoreLabel = scoreBadge.querySelector('.text-sm');

        if (scoreValue) {
            scoreValue.textContent = results.score;
            scoreValue.style.color = seoAnalyzer.getScoreColor(results.score);
        }

        if (scoreLabel) {
            scoreLabel.textContent = '/ ' + seoAnalyzer.getScoreLabel(results.score);
        }

        // Update badge background based on score
        scoreBadge.className = 'px-3 py-1 rounded-full flex items-center gap-1 ';
        if (results.score >= 80) {
            scoreBadge.className += 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
        } else if (results.score >= 60) {
            scoreBadge.className += 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
        } else {
            scoreBadge.className += 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
        }
    }

    // Update alerts
    const alertsContainer = document.getElementById('seo-alerts');
    if (alertsContainer) {
        if (results.alerts.length === 0) {
            alertsContainer.innerHTML = '<div class="text-gray-400 text-center py-4">No hay alertas SEO</div>';
        } else {
            alertsContainer.innerHTML = results.alerts.map(alert => `
                <div class="flex items-start gap-3 p-3 rounded-lg ${getAlertClass(alert.type)}">
                    <span class="text-lg flex-shrink-0">${alert.icon}</span>
                    <span class="text-sm">${alert.message}</span>
                </div>
            `).join('');
        }
    }

    // Update suggestions
    if (results.suggestions.length > 0) {
        const suggestionsHTML = results.suggestions.map(s => `
            <div class="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span class="text-orange-500">•</span>
                <span>${s}</span>
            </div>
        `).join('');

        // Add to alerts container if exists
        if (alertsContainer && results.suggestions.length > 0) {
            const suggestionsSection = `
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 class="font-bold text-sm mb-3">💡 Sugerencias</h4>
                    <div class="space-y-2">${suggestionsHTML}</div>
                </div>
            `;
            alertsContainer.insertAdjacentHTML('beforeend', suggestionsSection);
        }
    }
}

function getAlertClass(type) {
    switch (type) {
        case 'success':
            return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300';
        case 'warning':
            return 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300';
        case 'error':
            return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
        case 'info':
        default:
            return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
    }
}

// Initialize V7 Mockup
function initV7Mockup() {
    console.log('🚀 Initializing V7 Mockup...');

    setupPreviewToggles();
    updateArticleTitleDisplay();
    updateSEOSnippet();
    updateHeroImageDisplay();
    initSEOAnalyzer();

    console.log('✅ V7 Mockup initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV7Mockup);
} else {
    initV7Mockup();
}
