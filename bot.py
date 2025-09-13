import logging
from binance.client import Client
from binance.enums import *

class BasicBot:
    def __init__(self, api_key, api_secret, testnet=True):
        self.client = Client(api_key, api_secret, testnet=testnet)

        # Setup logging
        logging.basicConfig(
            filename="bot.log",
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s"
        )

    def place_order(self, symbol, side, order_type, quantity, price=None):
        try:
            # Input validation
            if side not in ["BUY", "SELL"]:
                raise ValueError("Invalid side. Must be BUY or SELL.")
            
            if order_type not in ["MARKET", "LIMIT"]:
                raise ValueError("Invalid order type. Must be MARKET or LIMIT.")

            logging.info(f"Placing {order_type} order: {side} {quantity} {symbol} at {price if price else 'Market Price'}")

            if order_type == "MARKET":
                order = self.client.futures_create_order(
                    symbol=symbol,
                    side=side,
                    type=FUTURE_ORDER_TYPE_MARKET,
                    quantity=quantity
                )
            elif order_type == "LIMIT":
                if price is None:
                    raise ValueError("Price must be specified for LIMIT orders.")
                order = self.client.futures_create_order(
                    symbol=symbol,
                    side=side,
                    type=FUTURE_ORDER_TYPE_LIMIT,
                    timeInForce=TIME_IN_FORCE_GTC,
                    quantity=quantity,
                    price=price
                )

            logging.info(f"Order successful: {order}")
            print("✅ Order placed successfully:", order)
            return order

        except Exception as e:
            logging.error(f"Order failed: {str(e)}")
            print("❌ Error placing order:", str(e))
            return None


if __name__ == "__main__":
    # Replace with your testnet API keys
    API_KEY = "192d57b95cd53b9086002f833f252ebae55b80ff3ba0c4c0586c12d773f6b81a"
    API_SECRET = "1a5dc001890fa8f826b2ef99837468c830e6d82c4db7b353328c0980368383cb"

    bot = BasicBot(API_KEY, API_SECRET)

    # CLI Input
    try:
        symbol = input("Enter symbol (e.g. BTCUSDT): ").upper().strip()
        side = input("Enter side (BUY/SELL): ").upper().strip()
        order_type = input("Enter order type (MARKET/LIMIT): ").upper().strip()
        quantity = float(input("Enter quantity: "))

        price = None
        if order_type == "LIMIT":
            price = float(input("Enter limit price: "))

        bot.place_order(symbol, side, order_type, quantity, price)

    except ValueError as ve:
        print("❌ Invalid input:", ve)
    except Exception as e:
        print("❌ Unexpected error:", e)
