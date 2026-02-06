// Theme management (dark mode)
export function initTheme() {
    const html = document.documentElement;

    // Check if user has a saved preference, otherwise use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply theme: saved preference > system preference > light (default)
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;

    if (shouldBeDark) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    // Listen for system theme changes (only if user hasn't set a preference)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only apply system changes if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        }
    });
}

export function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');

    // Save user preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    return isDark;
}

// Expose globally
window.toggleTheme = toggleTheme;
