/**
 * Sidebar Manager for V7
 * Handles tab switching, collapse/expand, and state persistence
 */

export class SidebarManager {
    constructor() {
        this.currentTab = 'editor'; // Default tab
        this.isCollapsed = false;
        this.init();
    }

    init() {
        this.loadState();
        this.attachEventListeners();
        this.showTab(this.currentTab);
        console.log('✅ Sidebar initialized');
    }

    /**
     * Attach event listeners to sidebar elements
     */
    attachEventListeners() {
        // Tab buttons
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Collapse/expand button
        const collapseBtn = document.getElementById('sidebar-collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleCollapse());
        }
    }

    /**
     * Switch to a specific tab
     */
    switchTab(tabName) {
        if (this.currentTab === tabName) return;

        // Update active button
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Show selected tab content
        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }

        this.currentTab = tabName;
        this.saveState();

        // Trigger custom event for other modules
        window.dispatchEvent(new CustomEvent('tabChanged', {
            detail: { tab: tabName }
        }));
    }

    /**
     * Show a specific tab (used on init)
     */
    showTab(tabName) {
        this.switchTab(tabName);
    }

    /**
     * Toggle sidebar collapse/expand
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        const sidebar = document.getElementById('v7-sidebar');
        const mainContent = document.getElementById('v7-main-content');

        if (this.isCollapsed) {
            sidebar?.classList.add('collapsed');
            mainContent?.classList.add('sidebar-collapsed');
        } else {
            sidebar?.classList.remove('collapsed');
            mainContent?.classList.remove('sidebar-collapsed');
        }

        this.saveState();
    }

    /**
     * Save sidebar state to localStorage
     */
    saveState() {
        const state = {
            currentTab: this.currentTab,
            isCollapsed: this.isCollapsed
        };
        localStorage.setItem('v7-sidebar-state', JSON.stringify(state));
    }

    /**
     * Load sidebar state from localStorage
     */
    loadState() {
        const savedState = localStorage.getItem('v7-sidebar-state');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.currentTab = state.currentTab || 'editor';
                this.isCollapsed = state.isCollapsed || false;
            } catch (e) {
                console.warn('Failed to load sidebar state:', e);
            }
        }
    }
}

// Initialize sidebar when DOM is ready
export function initSidebar() {
    return new SidebarManager();
}
