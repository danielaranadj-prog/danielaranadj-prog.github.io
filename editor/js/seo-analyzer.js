// ========================================
// SEO Analyzer - Real-time SEO Analysis
// ========================================

class SEOAnalyzer {
    constructor() {
        this.score = 0;
        this.alerts = [];
        this.suggestions = [];
    }

    /**
     * Analyze content and calculate SEO score
     */
    analyze(data) {
        const { title, description, content, heroImage } = data;

        this.alerts = [];
        this.suggestions = [];
        let score = 0;
        const maxScore = 100;

        // 1. Title Analysis (20 points)
        const titleScore = this.analyzeTitle(title);
        score += titleScore;

        // 2. Meta Description (15 points)
        const descScore = this.analyzeDescription(description);
        score += descScore;

        // 3. Content Length (15 points)
        const lengthScore = this.analyzeContentLength(content);
        score += lengthScore;

        // 4. Headings Structure (15 points)
        const headingsScore = this.analyzeHeadings(content);
        score += headingsScore;

        // 5. Images with Alt Text (10 points)
        const imageScore = this.analyzeImages(content, heroImage);
        score += imageScore;

        // 6. Keyword Usage (15 points)
        const keywordScore = this.analyzeKeywords(title, description, content);
        score += keywordScore;

        // 7. Readability (10 points)
        const readabilityScore = this.analyzeReadability(content);
        score += readabilityScore;

        this.score = Math.min(score, maxScore);

        return {
            score: this.score,
            alerts: this.alerts,
            suggestions: this.suggestions,
            details: {
                title: titleScore,
                description: descScore,
                content: lengthScore,
                headings: headingsScore,
                images: imageScore,
                keywords: keywordScore,
                readability: readabilityScore
            }
        };
    }

    /**
     * Analyze title (20 points max)
     */
    analyzeTitle(title) {
        if (!title || title.trim().length === 0) {
            this.alerts.push({
                type: 'error',
                message: 'Falta el título del artículo',
                icon: '❌'
            });
            this.suggestions.push('Agrega un título descriptivo entre 50-60 caracteres');
            return 0;
        }

        const length = title.length;

        if (length < 30) {
            this.alerts.push({
                type: 'warning',
                message: `Título muy corto (${length} caracteres)`,
                icon: '⚠️'
            });
            this.suggestions.push('El título debe tener al menos 50 caracteres para SEO');
            return 5;
        }

        if (length > 65) {
            this.alerts.push({
                type: 'warning',
                message: `Título muy largo (${length} caracteres)`,
                icon: '⚠️'
            });
            this.suggestions.push('El título no debe exceder 60 caracteres (se trunca en Google)');
            return 12;
        }

        if (length >= 50 && length <= 60) {
            this.alerts.push({
                type: 'success',
                message: `Título optimizado (${length} caracteres)`,
                icon: '✅'
            });
            return 20;
        }

        return 15;
    }

    /**
     * Analyze meta description (15 points max)
     */
    analyzeDescription(description) {
        if (!description || description.trim().length === 0) {
            this.alerts.push({
                type: 'error',
                message: 'Falta la descripción SEO',
                icon: '❌'
            });
            this.suggestions.push('Agrega una meta descripción de 150-160 caracteres');
            return 0;
        }

        const length = description.length;

        if (length < 120) {
            this.alerts.push({
                type: 'warning',
                message: `Descripción corta (${length} caracteres)`,
                icon: '⚠️'
            });
            this.suggestions.push('La descripción debe tener al menos 150 caracteres');
            return 5;
        }

        if (length > 165) {
            this.alerts.push({
                type: 'warning',
                message: `Descripción larga (${length} caracteres)`,
                icon: '⚠️'
            });
            this.suggestions.push('La descripción no debe exceder 160 caracteres');
            return 10;
        }

        this.alerts.push({
            type: 'success',
            message: `Descripción optimizada (${length} caracteres)`,
            icon: '✅'
        });
        return 15;
    }

    /**
     * Analyze content length (15 points max)
     */
    analyzeContentLength(content) {
        if (!content) {
            this.alerts.push({
                type: 'error',
                message: 'Sin contenido',
                icon: '❌'
            });
            this.suggestions.push('Escribe al menos 600 palabras de contenido');
            return 0;
        }

        const wordCount = this.countWords(content);

        if (wordCount < 300) {
            this.alerts.push({
                type: 'error',
                message: `Contenido muy corto (${wordCount} palabras)`,
                icon: '❌'
            });
            this.suggestions.push('Artículos con más de 600 palabras rankean mejor');
            return 0;
        }

        if (wordCount < 600) {
            this.alerts.push({
                type: 'warning',
                message: `Contenido corto (${wordCount} palabras)`,
                icon: '⚠️'
            });
            this.suggestions.push(`Agrega ${600 - wordCount} palabras más para mejor SEO`);
            return 8;
        }

        this.alerts.push({
            type: 'success',
            message: `Contenido extenso (${wordCount} palabras)`,
            icon: '✅'
        });
        return 15;
    }

    /**
     * Analyze headings structure (15 points max)
     */
    analyzeHeadings(content) {
        if (!content) return 0;

        const h1Count = (content.match(/^# /gm) || []).length;
        const h2Count = (content.match(/^## /gm) || []).length;
        const h3Count = (content.match(/^### /gm) || []).length;

        let score = 0;

        // Check H1 (should have exactly 1 - but this is the article title)
        if (h1Count > 1) {
            this.alerts.push({
                type: 'warning',
                message: `Múltiples H1 detectados (${h1Count})`,
                icon: '⚠️'
            });
            this.suggestions.push('Usa solo un H1 (título principal)');
        }

        // Check H2 (should have at least 2)
        if (h2Count === 0) {
            this.alerts.push({
                type: 'error',
                message: 'Sin títulos H2',
                icon: '❌'
            });
            this.suggestions.push('Agrega al menos 2-3 subtítulos H2 para estructura');
            return 0;
        } else if (h2Count < 2) {
            this.alerts.push({
                type: 'warning',
                message: `Solo ${h2Count} H2`,
                icon: '⚠️'
            });
            this.suggestions.push('Agrega más subtítulos H2 para mejor estructura');
            score = 8;
        } else {
            this.alerts.push({
                type: 'success',
                message: `Estructura de headings correcta (${h2Count} H2, ${h3Count} H3)`,
                icon: '✅'
            });
            score = 15;
        }

        return score;
    }

    /**
     * Analyze images (10 points max)
     */
    analyzeImages(content, heroImage) {
        let score = 0;

        // Check hero image
        if (!heroImage || heroImage.trim().length === 0) {
            this.alerts.push({
                type: 'warning',
                message: 'Sin imagen destacada',
                icon: '⚠️'
            });
            this.suggestions.push('Agrega una imagen destacada para el artículo');
        } else {
            score += 5;
        }

        // Check images in content
        const imageMatches = content?.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];
        const imagesWithoutAlt = imageMatches.filter(img => {
            const altMatch = img.match(/!\[([^\]]*)\]/);
            return !altMatch || !altMatch[1] || altMatch[1].trim().length === 0;
        });

        if (imagesWithoutAlt.length > 0) {
            this.alerts.push({
                type: 'warning',
                message: `${imagesWithoutAlt.length} imagen(es) sin texto ALT`,
                icon: '⚠️'
            });
            this.suggestions.push('Agrega descripciones ALT a todas las imágenes');
        } else if (imageMatches.length > 0) {
            this.alerts.push({
                type: 'success',
                message: `Todas las imágenes tienen ALT (${imageMatches.length})`,
                icon: '✅'
            });
            score += 5;
        }

        return score;
    }

    /**
     * Analyze keyword usage (15 points max)
     */
    analyzeKeywords(title, description, content) {
        if (!title || !content) return 0;

        // Extract potential keywords from title
        const titleWords = title.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 4); // Only words with 5+ chars

        if (titleWords.length === 0) return 0;

        const mainKeyword = titleWords[0]; // Use first significant word
        const contentLower = (content || '').toLowerCase();
        const descLower = (description || '').toLowerCase();

        // Check keyword in description
        const inDescription = descLower.includes(mainKeyword);

        // Count keyword density in content
        const keywordCount = (contentLower.match(new RegExp(mainKeyword, 'g')) || []).length;
        const totalWords = this.countWords(content);
        const density = (keywordCount / totalWords) * 100;

        let score = 0;

        if (!inDescription) {
            this.alerts.push({
                type: 'warning',
                message: `Keyword "${mainKeyword}" no está en la descripción`,
                icon: '⚠️'
            });
            this.suggestions.push(`Incluye "${mainKeyword}" en la meta descripción`);
        } else {
            score += 5;
        }

        if (density < 0.5) {
            this.alerts.push({
                type: 'warning',
                message: `Baja densidad de keyword (${density.toFixed(1)}%)`,
                icon: '⚠️'
            });
            this.suggestions.push(`Menciona "${mainKeyword}" más veces en el contenido (ideal 1-2%)`);
            score += 3;
        } else if (density > 3) {
            this.alerts.push({
                type: 'warning',
                message: `Alta densidad de keyword (${density.toFixed(1)}%) - puede parecer spam`,
                icon: '⚠️'
            });
            this.suggestions.push('Reduce el uso excesivo de keywords');
            score += 8;
        } else {
            this.alerts.push({
                type: 'success',
                message: `Densidad de keyword óptima (${density.toFixed(1)}%)`,
                icon: '✅'
            });
            score += 10;
        }

        return score;
    }

    /**
     * Analyze readability (10 points max)
     */
    analyzeReadability(content) {
        if (!content) return 0;

        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = this.countWords(content);
        const avgWordsPerSentence = words / sentences.length;

        let score = 0;

        if (avgWordsPerSentence > 25) {
            this.alerts.push({
                type: 'warning',
                message: 'Frases muy largas (dificulta lectura)',
                icon: '⚠️'
            });
            this.suggestions.push('Divide frases largas para mejor legibilidad');
            score = 5;
        } else if (avgWordsPerSentence < 10) {
            this.alerts.push({
                type: 'info',
                message: 'Frases muy cortas',
                icon: 'ℹ️'
            });
            score = 8;
        } else {
            this.alerts.push({
                type: 'success',
                message: 'Legibilidad óptima',
                icon: '✅'
            });
            score = 10;
        }

        return score;
    }

    /**
     * Count words in text
     */
    countWords(text) {
        if (!text) return 0;
        // Remove markdown syntax
        const cleanText = text
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/#{1,6}\s/g, '') // Remove heading markers
            .replace(/[*_~`]/g, '') // Remove formatting
            .trim();

        return cleanText.split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Get score color
     */
    getScoreColor(score) {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#f59e0b'; // Amber
        if (score >= 40) return '#f97316'; // Orange
        return '#ef4444'; // Red
    }

    /**
     * Get score label
     */
    getScoreLabel(score) {
        if (score >= 80) return 'Excelente';
        if (score >= 60) return 'Bueno';
        if (score >= 40) return 'Mejorable';
        return 'Bajo';
    }
}

// Export for use
window.SEOAnalyzer = SEOAnalyzer;
