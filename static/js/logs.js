// Logs-specific JavaScript functionality

class LogsManager {
    constructor() {
        this.originalLogs = [];
        this.filteredLogs = [];
        this.init();
    }

    init() {
        this.loadLogs();
        this.updateStatistics();
        this.setupAutoRefresh();
    }

    loadLogs() {
        // Get logs from the page
        const logEntries = document.querySelectorAll('.log-entry');
        this.originalLogs = Array.from(logEntries).map(entry => entry.textContent);
        this.filteredLogs = [...this.originalLogs];
    }

    updateStatistics() {
        let infoCount = 0;
        let warningCount = 0;
        let errorCount = 0;
        let totalOrders = 0;
        let successfulOrders = 0;

        this.originalLogs.forEach(log => {
            if (log.includes('INFO')) infoCount++;
            if (log.includes('WARNING')) warningCount++;
            if (log.includes('ERROR')) errorCount++;
            if (log.includes('Order successful')) {
                totalOrders++;
                successfulOrders++;
            }
            if (log.includes('Order failed')) {
                totalOrders++;
            }
        });

        // Update statistics display
        document.getElementById('infoCount').textContent = infoCount;
        document.getElementById('warningCount').textContent = warningCount;
        document.getElementById('errorCount').textContent = errorCount;
        document.getElementById('totalOrders').textContent = totalOrders;
        
        const successRate = totalOrders > 0 ? ((successfulOrders / totalOrders) * 100).toFixed(1) : 0;
        document.getElementById('successRate').textContent = successRate + '%';
    }

    setupAutoRefresh() {
        // Auto-refresh logs every 30 seconds
        setInterval(() => {
            this.refreshLogs();
        }, 30000);
    }

    async refreshLogs() {
        try {
            const response = await fetch('/logs');
            if (response.ok) {
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newLogsContainer = doc.querySelector('.logs-container');
                const currentLogsContainer = document.querySelector('.logs-container');
                
                if (newLogsContainer && currentLogsContainer) {
                    currentLogsContainer.innerHTML = newLogsContainer.innerHTML;
                    this.loadLogs();
                    this.updateStatistics();
                    this.applyCurrentFilters();
                    
                    // Show refresh notification
                    this.showNotification('Logs refreshed successfully', 'success');
                }
            }
        } catch (error) {
            console.error('Failed to refresh logs:', error);
            this.showNotification('Failed to refresh logs', 'error');
        }
    }

    applyCurrentFilters() {
        const logLevel = document.getElementById('logLevel').value;
        const searchTerm = document.getElementById('logSearch').value;
        const dateFilter = document.getElementById('dateFilter').value;

        this.filterLogs(logLevel, searchTerm, dateFilter);
    }

    filterLogs(level = 'all', searchTerm = '', dateFilter = '') {
        let filtered = [...this.originalLogs];

        // Filter by log level
        if (level !== 'all') {
            filtered = filtered.filter(log => log.includes(level));
        }

        // Filter by search term
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            filtered = filtered.filter(log => regex.test(log));
        }

        // Filter by date
        if (dateFilter) {
            filtered = filtered.filter(log => {
                // Extract date from log entry (assuming format includes date)
                const dateMatch = log.match(/\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                    return dateMatch[0] === dateFilter;
                }
                return false;
            });
        }

        this.filteredLogs = filtered;
        this.displayFilteredLogs();
    }

    displayFilteredLogs() {
        const logsContainer = document.querySelector('.logs-container');
        
        if (this.filteredLogs.length === 0) {
            logsContainer.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-search fa-2x mb-3"></i>
                    <p>No logs match the current filters.</p>
                </div>
            `;
            return;
        }

        logsContainer.innerHTML = this.filteredLogs.map(log => {
            const logClass = this.getLogClass(log);
            return `<div class="log-entry ${logClass}">${this.highlightSearchTerm(log)}</div>`;
        }).join('');

        // Scroll to bottom
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    getLogClass(log) {
        if (log.includes('ERROR')) return 'log-error';
        if (log.includes('WARNING')) return 'log-warning';
        if (log.includes('INFO')) return 'log-info';
        return '';
    }

    highlightSearchTerm(log) {
        const searchTerm = document.getElementById('logSearch').value;
        if (!searchTerm) return log;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return log.replace(regex, '<mark>$1</mark>');
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Global functions for template usage
function refreshLogs() {
    if (window.logsManager) {
        window.logsManager.refreshLogs();
    }
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
        // In a real implementation, this would call an API endpoint
        document.querySelector('.logs-container').innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="fas fa-broom fa-2x mb-3"></i>
                <p>Logs cleared successfully.</p>
            </div>
        `;
        
        if (window.logsManager) {
            window.logsManager.originalLogs = [];
            window.logsManager.updateStatistics();
        }
    }
}

function downloadLogs() {
    const logs = window.logsManager ? window.logsManager.originalLogs : [];
    
    if (logs.length === 0) {
        alert('No logs available to download.');
        return;
    }

    const logContent = logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    if (window.logsManager) {
        window.logsManager.showNotification('Logs downloaded successfully', 'success');
    }
}

function filterLogs() {
    const logLevel = document.getElementById('logLevel').value;
    const searchTerm = document.getElementById('logSearch').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    if (window.logsManager) {
        window.logsManager.filterLogs(logLevel, searchTerm, dateFilter);
    }
}

function searchLogs() {
    filterLogs();
}

function filterByDate() {
    filterLogs();
}

// Initialize logs manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.logsManager = new LogsManager();
});

// Add CSS for log highlighting
const style = document.createElement('style');
style.textContent = `
    .log-error {
        border-left-color: #dc3545 !important;
        background: rgba(220, 53, 69, 0.1);
    }
    
    .log-warning {
        border-left-color: #ffc107 !important;
        background: rgba(255, 193, 7, 0.1);
    }
    
    .log-info {
        border-left-color: #17a2b8 !important;
        background: rgba(23, 162, 184, 0.1);
    }
    
    .log-entry mark {
        background: #ffeb3b;
        padding: 2px 4px;
        border-radius: 3px;
    }
    
    .stat-item {
        padding: 10px;
    }
    
    .stat-number {
        font-size: 1.5rem;
        font-weight: bold;
    }
    
    .stat-label {
        font-size: 0.9rem;
        color: #6c757d;
    }
`;
document.head.appendChild(style);