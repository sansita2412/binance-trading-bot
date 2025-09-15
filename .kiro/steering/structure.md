# Project Structure

## Root Level Files
- `app.py` - Main Flask application with routes and web interface
- `bot.py` - Core trading bot logic and Binance API integration
- `README.md` - Project documentation and setup instructions

## Directory Structure

### `/templates/` - Jinja2 HTML Templates
- `base.html` - Base template with navigation, Bootstrap, and common layout
- `index.html` - Landing page with feature cards and navigation
- `setup.html` - API configuration form with security notices
- `trading.html` - Main trading interface for placing orders
- `logs.html` - Log viewer for monitoring bot activity

### `/static/` - Static Assets
- `/css/style.css` - Custom styling with gradients, animations, and responsive design
- `/js/main.js` - Core JavaScript functionality and TradingBot class
- `/js/setup.js` - Setup page specific JavaScript
- `/js/trading.js` - Trading interface JavaScript
- `/js/logs.js` - Log viewer JavaScript

## Architecture Patterns

### Backend (Flask)
- **Route Structure**: RESTful endpoints (`/`, `/setup`, `/trading`, `/logs`, `/place_order`)
- **Global State**: Single bot instance stored globally
- **Error Handling**: Try-catch with user-friendly flash messages
- **API Integration**: Centralized in `BasicBot` class

### Frontend (JavaScript)
- **Class-based Architecture**: `TradingBot` main class with modular methods
- **Event-driven**: Form submissions, input validation, real-time updates
- **Utility Classes**: `FormValidator`, `PriceFormatter` for reusable functions
- **Animation System**: CSS classes with JavaScript triggers

### Styling Conventions
- **Bootstrap 5**: Primary UI framework with custom overrides
- **Gradient Themes**: Consistent color scheme across components
- **Card-based Layout**: All major sections use Bootstrap cards
- **Responsive Design**: Mobile-first approach with breakpoints
- **Icon Usage**: Font Awesome icons for all UI elements

## File Naming Conventions
- Templates: lowercase with descriptive names (`setup.html`, `trading.html`)
- Static files: organized by type in subdirectories
- Python files: lowercase with underscores (`app.py`, `bot.py`)
- CSS classes: kebab-case for custom styles, Bootstrap classes as-is