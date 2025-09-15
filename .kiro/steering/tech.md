# Technology Stack

## Backend
- **Framework**: Flask (Python web framework)
- **API Client**: python-binance library for Binance API integration
- **Logging**: Python's built-in logging module with file output to `bot.log`
- **Session Management**: Flask sessions with secret key

## Frontend
- **UI Framework**: Bootstrap 5.1.3 (CDN)
- **Icons**: Font Awesome 6.0.0 (CDN)
- **JavaScript**: Vanilla ES6+ with class-based architecture
- **Styling**: Custom CSS with gradient themes and animations

## Dependencies
```bash
pip install python-binance flask
```

## Development Commands

### Running the Application
```bash
python app.py
```
- Runs on `http://0.0.0.0:5000` with debug mode enabled
- Hot reload enabled for development

### Testing Bot Functionality
```bash
python bot.py
```
- Runs CLI version for direct API testing
- Requires API credentials to be hardcoded (for testing only)

## Configuration
- **Debug Mode**: Enabled by default in `app.py`
- **Host**: `0.0.0.0` (accessible from network)
- **Port**: `5000`
- **Testnet**: Default enabled for safety

## API Integration
- Uses Binance Futures API
- Supports both testnet and mainnet
- Required permissions: Reading, Futures, Spot & Margin Trading
- No withdrawal permissions needed