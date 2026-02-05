// Global helper functions for Tiptap
// These are called from HTML onclick handlers

window.insertVideoLink = function () {
    const url = prompt('Ingresa la URL del video (YouTube o TikTok):');
    if (url && window.tiptapService?.editor) {
        window.tiptapService.insertVideo(url);
    }
};

window.insertCtaLink = function () {
    const url = prompt('URL del destino:');
    if (!url) return;

    const emoji = prompt('Emoji:', '✈️');
    const label = prompt('Label:', 'DESTINO');
    const title = prompt('Título:');
    const description = prompt('Descripción:');

    if (title && window.tiptapService?.editor) {
        window.tiptapService.insertCTA({
            url,
            emoji: emoji || '✈️',
            label: label || 'DESTINO',
            title,
            description: description || ''
        });
    }
};
