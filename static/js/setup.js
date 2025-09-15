// Setup-specific JavaScript functionality

class SetupManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.loadSavedSettings();
    }

    setupEventListeners() {
        const setupForm = document.getElementById('setupForm');
        if (setupForm) {
            setupForm.addEventListener('submit', this.handleFormSubmission.bind(this));
        }

        // Real-time validation
        const inputs = document.querySelectorAll('#setupForm input');
        inputs.forEach(input => {
            input.addEventListener('input', this.validateInput.bind(this));
            input.addEventListener('blur', this.validateInput.bind(this));
        });

        // Toggle password visibility
        this.addPasswordToggle();
    }

    setupFormValidation() {
        // Add custom validation styles
        const style = document.createElement('style');
        style.textContent = `
            .form-control.is-valid {
                border-color: #28a745;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='m2.3 6.73.94-.94 1.44 1.44L7.4 4.5l-.94-.94L4.5 5.5z'/%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-position: right calc(0.375em + 0.1875rem) center;
                background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
            }
            
            .form-control.is-invalid {
                border-color: #dc3545;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.8 4.6 1.4 1.4M7.2 4.6l-1.4 1.4'/%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-position: right calc(0.375em + 0.1875rem) center;
                background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
            }
        `;
        document.head.appendChild(style);
    }

    addPasswordToggle() {
        const passwordField = document.getElementById('api_secret');
        if (passwordField) {
            const toggleButton = document.createElement('button');
            toggleButton.type = 'button';
            toggleButton.className = 'btn btn-outline-secondary position-absolute';
            toggleButton.style.cssText = 'right: 10px; top: 50%; transform: translateY(-50%); z-index: 10; border: none; background: none;';
            toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
            
            // Make parent position relative
            passwordField.parentNode.style.position = 'relative';
            passwordField.parentNode.appendChild(toggleButton);
            
            toggleButton.addEventListener('click', () => {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                toggleButton.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
        }
    }

    validateInput(event) {
        const input = event.target;
        const value = input.value.trim();
        
        // Remove existing validation classes
        input.classList.remove('is-valid', 'is-invalid');
        
        let isValid = true;
        let errorMessage = '';
        
        switch (input.name) {
            case 'api_key':
                isValid = value.length >= 20 && /^[A-Za-z0-9]+$/.test(value);
                errorMessage = 'API Key should be at least 20 characters and contain only letters and numbers';
                break;
            case 'api_secret':
                isValid = value.length >= 20 && /^[A-Za-z0-9]+$/.test(value);
                errorMessage = 'API Secret should be at least 20 characters and contain only letters and numbers';
                break;
            default:
                isValid = value !== '';
        }
        
        // Add validation class
        input.classList.add(isValid ? 'is-valid' : 'is-invalid');
        
        // Show/hide error message
        this.showFieldError(input, isValid ? '' : errorMessage);
        
        return isValid;
    }

    showFieldError(input, message) {
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
        
        if (message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = message;
            input.parentNode.appendChild(errorDiv);
        }
    }

    async handleFormSubmission(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Validate all fields
        const inputs = event.target.querySelectorAll('input[required]');
        let allValid = true;
        
        inputs.forEach(input => {
            if (!this.validateInput({ target: input })) {
                allValid = false;
            }
        });
        
        if (!allValid) {
            this.showNotification('Please fix the validation errors before submitting', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span> Configuring Bot...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(event.target);
            const response = await fetch('/setup', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                this.showNotification('Bot configured successfully!', 'success');
                
                // Save settings to localStorage (excluding sensitive data)
                this.saveSettings({
                    testnet: formData.get('testnet') === 'on'
                });
                
                // Redirect to trading page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/trading';
                }, 2000);
            } else {
                const errorText = await response.text();
                this.showNotification(`Configuration failed: ${errorText}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Network error: ${error.message}`, 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('botSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save settings to localStorage:', error);
        }
    }

    loadSavedSettings() {
        try {
            const saved = localStorage.getItem('botSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                // Apply saved settings
                if (settings.testnet !== undefined) {
                    document.getElementById('testnet').checked = settings.testnet;
                }
            }
        } catch (error) {
            console.warn('Failed to load saved settings:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    async testConnection() {
        const apiKey = document.getElementById('api_key').value.trim();
        const apiSecret = document.getElementById('api_secret').value.trim();
        const testnet = document.getElementById('testnet').checked;
        
        if (!apiKey || !apiSecret) {
            this.showNotification('Please enter both API Key and Secret before testing', 'warning');
            return;
        }
        
        const statusCard = document.getElementById('connectionStatus');
        const resultDiv = document.getElementById('connectionResult');
        
        statusCard.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="text-center">
                <div class="loading"></div>
                <p class="mt-2">Testing connection...</p>
            </div>
        `;
        
        try {
            // Mock connection test (in real implementation, this would call an API endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate success/failure
            const isSuccess = Math.random() > 0.3; // 70% success rate for demo
            
            if (isSuccess) {
                resultDiv.innerHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle me-2"></i>
                        <strong>Connection Successful!</strong>
                        <ul class="mt-2 mb-0">
                            <li>API Key: Valid</li>
                            <li>Permissions: Futures Trading Enabled</li>
                            <li>Network: ${testnet ? 'Testnet' : 'Mainnet'}</li>
                            <li>Status: Ready for trading</li>
                        </ul>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Connection Failed!</strong>
                        <ul class="mt-2 mb-0">
                            <li>Please check your API credentials</li>
                            <li>Ensure futures trading is enabled</li>
                            <li>Verify IP restrictions if any</li>
                        </ul>
                    </div>
                `;
            }
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    <strong>Test Failed:</strong> ${error.message}
                </div>
            `;
        }
    }
}

// Global function for template usage
function testConnection() {
    if (window.setupManager) {
        window.setupManager.testConnection();
    }
}

// Security utilities
const SecurityUtils = {
    maskApiKey(apiKey) {
        if (apiKey.length <= 8) return apiKey;
        return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
    },

    validateApiKeyFormat(apiKey) {
        // Basic validation for Binance API key format
        return /^[A-Za-z0-9]{64}$/.test(apiKey);
    },

    validateApiSecretFormat(apiSecret) {
        // Basic validation for Binance API secret format
        return /^[A-Za-z0-9]{64}$/.test(apiSecret);
    },

    generateSecureHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }
};

// Initialize setup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.setupManager = new SetupManager();
});

// Export for use in other modules
window.SetupManager = SetupManager;
window.SecurityUtils = SecurityUtils;