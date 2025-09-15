from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
import json
from bot import BasicBot
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# Global bot instance
bot = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/setup', methods=['GET', 'POST'])
def setup():
    global bot
    if request.method == 'POST':
        api_key = request.form.get('api_key')
        api_secret = request.form.get('api_secret')
        testnet = request.form.get('testnet') == 'on'
        
        try:
            bot = BasicBot(api_key, api_secret, testnet=testnet)
            flash('Bot configured successfully!', 'success')
            return redirect(url_for('trading'))
        except Exception as e:
            flash(f'Configuration failed: {str(e)}', 'error')
    
    return render_template('setup.html')

@app.route('/trading')
def trading():
    if bot is None:
        flash('Please configure your bot first', 'warning')
        return redirect(url_for('setup'))
    return render_template('trading.html')

@app.route('/place_order', methods=['POST'])
def place_order():
    global bot
    if bot is None:
        return jsonify({'success': False, 'error': 'Bot not configured'})
    
    try:
        data = request.get_json()
        symbol = data.get('symbol', '').upper()
        side = data.get('side', '').upper()
        order_type = data.get('order_type', '').upper()
        quantity = float(data.get('quantity', 0))
        price = float(data.get('price', 0)) if data.get('price') else None
        
        result = bot.place_order(symbol, side, order_type, quantity, price)
        
        if result:
            return jsonify({'success': True, 'order': result})
        else:
            return jsonify({'success': False, 'error': 'Order failed'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/logs')
def logs():
    try:
        if os.path.exists('bot.log'):
            with open('bot.log', 'r') as f:
                logs = f.readlines()[-50:]  # Last 50 lines
            return render_template('logs.html', logs=logs)
        else:
            return render_template('logs.html', logs=[])
    except Exception as e:
        return render_template('logs.html', logs=[f'Error reading logs: {str(e)}'])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)