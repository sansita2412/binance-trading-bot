// Trading-specific JavaScript functionality

class TradingInterface {
    constructor() {
        this.orderHistory = [];
        this.init();
    }

    init() {
        this.setupTradingEventListeners();
        this.initializeTradingUI();
        this.loadOrderHistory();
    }

    setupTradingEventListeners() {
        // Quick order buttons
        const quickOrderBtns = document.querySelectorAll('.quick-order-btn');
        quickOrderBtns.forEach(btn => {
            btn.addEventListener('click', this.handleQuickOrder.bind(this));
        });

        // Symbol search and autocomplete
        const symbolInput = document.getElementById('symbol');
        if (symbolInput) {
            symbolInput.addEventListener('input', this.handleSymbolSearch.bind(this));
        }

        // Quantity percentage buttons
        const percentageBtns = document.querySelectorAll('.percentage-btn');
        percentageBtns.forEach(btn => {
            btn.addEventListener('click', this.handlePercentageClick.bind(this));
        });

        // Price calculation helpers
        const priceHelpers = document.querySelectorAll('.price-helper');
        priceHelpers.forEach(helper => {
            helper.addEventListener('click', this.handlePriceHelper.bind(this));
        });
    }

    initializeTradingUI() {
        // Initialize order type visibility
        this.handleOrderTypeChange({ target: { value: 'MARKET' } });
        
        // Add real-time price updates (mock for now)
        this.startPriceUpdates();
        
        // Initialize balance display
        this.updateBalanceDisplay();
    }

    handleQuickOrder(event) {
        const btn = event.target;
        const side = btn.dataset.side;
        const symbol = btn.dataset.symbol;
        
        // Pre-fill form with quick order data
        document.getElementById('side').value = side;
        if (symbol) {
            document.getElementById('symbol').value = symbol;
        }
        
        // Highlight the selected side
        document.querySelectorAll('.quick-order-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    handleSymbolSearch(event) {
        const query = event.target.value.toUpperCase();
        
        // Mock symbol suggestions (in real app, this would call an API)
        const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'LTCUSDT'];
        const suggestions = symbols.filter(symbol => symbol.includes(query));
        
        this.displaySymbolSuggestions(suggestions, event.target);
    }

    displaySymbolSuggestions(suggestions, inputElement) {
        // Remove existing suggestions
        const existingSuggestions = document.querySelector('.symbol-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

        if (suggestions.length === 0 || inputElement.value.length < 2) {
            return;
        }

        // Create suggestions dropdown
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'symbol-suggestions';
        suggestionsDiv.innerHTML = suggestions.map(symbol => 
            `<div class="suggestion-item" data-symbol="${symbol}">${symbol}</div>`
        ).join('');

        // Position and show suggestions
        inputElement.parentNode.appendChild(suggestionsDiv);

        // Add click handlers to suggestions
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                inputElement.value = item.dataset.symbol;
                suggestionsDiv.remove();
                this.updateSymbolInfo(item.dataset.symbol);
            });
        });
    }

    handlePercentageClick(event) {
        const percentage = parseFloat(event.target.dataset.percentage);
        const balance = this.getCurrentBalance(); // Mock function
        const quantityInput = document.getElementById('quantity');
        
        if (quantityInput && balance) {
            const calculatedQuantity = (balance * percentage / 100).toFixed(6);
            quantityInput.value = calculatedQuantity;
            
            // Trigger validation
            quantityInput.dispatchEvent(new Event('input'));
        }
    }

    handlePriceHelper(event) {
        const helper = event.target.dataset.helper;
        const priceInput = document.getElementById('price');
        const currentPrice = this.getCurrentPrice(); // Mock function
        
        if (!priceInput || !currentPrice) return;
        
        let newPrice;
        switch (helper) {
            case 'market':
                newPrice = currentPrice;
                break;
            case 'above':
                newPrice = (currentPrice * 1.01).toFixed(8); // 1% above
                break;
            case 'below':
                newPrice = (currentPrice * 0.99).toFixed(8); // 1% below
                break;
        }
        
        if (newPrice) {
            priceInput.value = newPrice;
            priceInput.dispatchEvent(new Event('input'));
        }
    }

    updateSymbolInfo(symbol) {
        // Mock function to update symbol information
        const symbolInfo = document.getElementById('symbolInfo');
        if (symbolInfo) {
            symbolInfo.innerHTML = `
                <div class="symbol-details">
                    <h6>${symbol}</h6>
                    <p class="mb-1">Last Price: <span class="price-display">$45,230.50</span></p>
                    <p class="mb-1">24h Change: <span class="text-success">+2.34%</span></p>
                    <p class="mb-0">Volume: 1,234.56 BTC</p>
                </div>
            `;
        }
    }

    startPriceUpdates() {
        // Mock real-time price updates
        setInterval(() => {
            const priceElements = document.querySelectorAll('.price-display');
            priceElements.forEach(element => {
                const currentPrice = parseFloat(element.textContent.replace(/[^0-9.-]+/g, ''));
                if (currentPrice) {
                    const change = (Math.random() - 0.5) * 100; // Random price change
                    const newPrice = Math.max(0, currentPrice + change);
                    element.textContent = PriceFormatter.formatCurrency(newPrice);
                    
                    // Add visual feedback for price changes
                    element.classList.remove('price-up', 'price-down');
                    if (change > 0) {
                        element.classList.add('price-up');
                    } else if (change < 0) {
                        element.classList.add('price-down');
                    }
                }
            });
        }, 5000); // Update every 5 seconds
    }

    updateBalanceDisplay() {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            // Mock balance data
            balanceElement.innerHTML = `
                <div class="balance-info">
                    <div class="row">
                        <div class="col-6">
                            <small class="text-muted">USDT Balance</small>
                            <div class="fw-bold">1,234.56</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">BTC Balance</small>
                            <div class="fw-bold">0.02345</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    loadOrderHistory() {
        // Mock order history loading
        const historyContainer = document.getElementById('orderHistory');
        if (historyContainer) {
            const mockOrders = [
                { id: '12345', symbol: 'BTCUSDT', side: 'BUY', quantity: '0.001', price: '45230.50', status: 'FILLED', time: new Date() },
                { id: '12346', symbol: 'ETHUSDT', side: 'SELL', quantity: '0.1', price: '3120.75', status: 'FILLED', time: new Date() }
            ];
            
            this.displayOrderHistory(mockOrders);
        }
    }

    displayOrderHistory(orders) {
        const historyContainer = document.getElementById('orderHistory');
        if (!historyContainer) return;
        
        historyContainer.innerHTML = orders.map(order => `
            <div class="order-history-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <small class="text-muted">#{order.id}</small>
                    </div>
                    <div class="col-md-2">
                        <strong>${order.symbol}</strong>
                    </div>
                    <div class="col-md-1">
                        <span class="badge bg-${order.side === 'BUY' ? 'success' : 'danger'}">${order.side}</span>
                    </div>
                    <div class="col-md-2">
                        ${order.quantity}
                    </div>
                    <div class="col-md-2">
                        <span class="price-display">${PriceFormatter.formatCurrency(order.price)}</span>
                    </div>
                    <div class="col-md-2">
                        <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <div class="col-md-1">
                        <small class="text-muted">${order.time.toLocaleTimeString()}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Mock helper functions (would be replaced with real API calls)
    getCurrentBalance() {
        return 1000; // Mock USDT balance
    }

    getCurrentPrice() {
        return 45230.50; // Mock BTC price
    }

    // Order management functions
    cancelOrder(orderId) {
        // Implementation for canceling orders
        console.log(`Canceling order ${orderId}`);
    }

    modifyOrder(orderId, newPrice, newQuantity) {
        // Implementation for modifying orders
        console.log(`Modifying order ${orderId}`);
    }
}

// Risk management utilities
const RiskManager = {
    calculatePositionSize(balance, riskPercentage, entryPrice, stopLoss) {
        const riskAmount = balance * (riskPercentage / 100);
        const priceRisk = Math.abs(entryPrice - stopLoss);
        return riskAmount / priceRisk;
    },

    validateOrder(orderData) {
        const errors = [];
        
        if (!orderData.symbol || orderData.symbol.length < 3) {
            errors.push('Invalid symbol');
        }
        
        if (!orderData.quantity || orderData.quantity <= 0) {
            errors.push('Invalid quantity');
        }
        
        if (orderData.order_type === 'LIMIT' && (!orderData.price || orderData.price <= 0)) {
            errors.push('Invalid price for limit order');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

// Initialize trading interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('orderForm')) {
        new TradingInterface();
    }
});

// Export for use in other modules
window.TradingInterface = TradingInterface;
window.RiskManager = RiskManager;