// Main JavaScript functionality for Trading Bot UI

class TradingBot {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.checkBotStatus();
    }

    setupEventListeners() {
        // Order form submission
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', this.handleOrderSubmission.bind(this));
        }

        // Order type change handler
        const orderTypeSelect = document.getElementById('order_type');
        if (orderTypeSelect) {
            orderTypeSelect.addEventListener('change', this.handleOrderTypeChange.bind(this));
        }

        // Real-time form validation
        const formInputs = document.querySelectorAll('.form-control');
        formInputs.forEach(input => {
            input.addEventListener('input', this.validateInput.bind(this));
            input.addEventListener('blur', this.validateInput.bind(this));
        });

        // Auto-refresh logs
        if (document.querySelector('.logs-container')) {
            this.startLogRefresh();
        }
    }

    initializeAnimations() {
        // Add fade-in animation to cards
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });

        // Add slide-in animation to alerts
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            alert.classList.add('slide-in');
        });
    }

    async handleOrderSubmission(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span> Placing Order...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(event.target);
            const orderData = {
                symbol: formData.get('symbol'),
                side: formData.get('side'),
                order_type: formData.get('order_type'),
                quantity: formData.get('quantity'),
                price: formData.get('price')
            };

            const response = await fetch('/place_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Order placed successfully!', 'success');
                this.displayOrderResult(result.order);
                event.target.reset();
            } else {
                this.showNotification(`Order failed: ${result.error}`, 'error');
            }

        } catch (error) {
            this.showNotification(`Network error: ${error.message}`, 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    handleOrderTypeChange(event) {
        const priceGroup = document.getElementById('priceGroup');
        if (priceGroup) {
            if (event.target.value === 'LIMIT') {
                priceGroup.style.display = 'block';
                priceGroup.classList.add('fade-in');
                document.getElementById('price').required = true;
            } else {
                priceGroup.style.display = 'none';
                document.getElementById('price').required = false;
            }
        }
    }

    validateInput(event) {
        const input = event.target;
        const value = input.value.trim();
        
        // Remove existing validation classes
        input.classList.remove('is-valid', 'is-invalid');
        
        // Validate based on input type
        let isValid = true;
        
        switch (input.name) {
            case 'symbol':
                isValid = value.length >= 3 && /^[A-Z]+$/.test(value);
                break;
            case 'quantity':
            case 'price':
                isValid = value !== '' && !isNaN(value) && parseFloat(value) > 0;
                break;
            default:
                isValid = value !== '';
        }
        
        // Add validation class
        input.classList.add(isValid ? 'is-valid' : 'is-invalid');
        
        return isValid;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of container
        const container = document.querySelector('.container');
        const firstChild = container.firstElementChild;
        container.insertBefore(notification, firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    displayOrderResult(order) {
        const resultContainer = document.getElementById('orderResult');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="card success-state">
                    <div class="card-body">
                        <h5 class="card-title">Order Executed</h5>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Order ID:</strong> ${order.orderId}</p>
                                <p><strong>Symbol:</strong> ${order.symbol}</p>
                                <p><strong>Side:</strong> <span class="badge bg-${order.side === 'BUY' ? 'success' : 'danger'}">${order.side}</span></p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Quantity:</strong> ${order.origQty}</p>
                                <p><strong>Price:</strong> <span class="price-display">${order.price || 'Market'}</span></p>
                                <p><strong>Status:</strong> <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultContainer.classList.add('fade-in');
        }
    }

    async checkBotStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            try {
                // This would be replaced with actual status check endpoint
                const isOnline = document.querySelector('[data-bot-configured]') !== null;
                statusIndicator.className = `status-indicator ${isOnline ? 'status-online' : 'status-offline'}`;
            } catch (error) {
                console.error('Failed to check bot status:', error);
            }
        }
    }

    startLogRefresh() {
        // Refresh logs every 30 seconds
        setInterval(async () => {
            try {
                const response = await fetch('/logs');
                if (response.ok) {
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newLogs = doc.querySelector('.logs-container');
                    const currentLogs = document.querySelector('.logs-container');
                    
                    if (newLogs && currentLogs) {
                        currentLogs.innerHTML = newLogs.innerHTML;
                    }
                }
            } catch (error) {
                console.error('Failed to refresh logs:', error);
            }
        }, 30000);
    }

    // Utility functions
    formatPrice(price) {
        return parseFloat(price).toFixed(8);
    }

    formatQuantity(quantity) {
        return parseFloat(quantity).toFixed(6);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy to clipboard', 'error');
        });
    }
}

// Form validation utilities
const FormValidator = {
    validateSymbol(symbol) {
        return /^[A-Z]{3,}$/.test(symbol.toUpperCase());
    },

    validateQuantity(quantity) {
        const num = parseFloat(quantity);
        return !isNaN(num) && num > 0;
    },

    validatePrice(price) {
        const num = parseFloat(price);
        return !isNaN(num) && num > 0;
    },

    formatSymbol(symbol) {
        return symbol.toUpperCase().trim();
    }
};

// Price formatting utilities
const PriceFormatter = {
    formatCurrency(amount, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(amount);
    },

    formatCrypto(amount, decimals = 8) {
        return parseFloat(amount).toFixed(decimals);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TradingBot();
    
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to submit forms
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeForm = document.querySelector('form:focus-within');
            if (activeForm) {
                activeForm.requestSubmit();
            }
        }
    });
});

// Export for use in other modules
window.TradingBot = TradingBot;
window.FormValidator = FormValidator;
window.PriceFormatter = PriceFormatter;