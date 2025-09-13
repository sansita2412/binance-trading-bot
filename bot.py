from binance.client import Client

class BasicBot:
    def __init__(self, api_key, api_secret, testnet=True):
        self.client = Client(api_key, api_secret, testnet=testnet)
        self.client.FUTURES_URL = "https://testnet.binancefuture.com"

    def place_order(self, side, order_type, quantity, symbol="BTCUSDT", price=None):
        try:
            if order_type == "MARKET":
                order = self.client.futures_create_order(
                    symbol=symbol,
                    side=side,
                    type="MARKET",
                    quantity=quantity
                )
            elif order_type == "LIMIT":
                order = self.client.futures_create_order(
                    symbol=symbol,
                    side=side,
                    type="LIMIT",
                    timeInForce="GTC",
                    quantity=quantity,
                    price=price
                )
            else:
                return f"Order type {order_type} not supported"

            return order
        except Exception as e:
            return f"Error: {e}"

# Example run
if __name__ == "__main__":
    api_key = "192d57b95cd53b9086002f833f252ebae55b80ff3ba0c4c0586c12d773f6b81a"
    api_secret = "1a5dc001890fa8f826b2ef99837468c830e6d82c4db7b353328c0980368383cb"

    bot = BasicBot(api_key, api_secret)

    # Place a market buy order for 0.01 BTC
    result = bot.place_order(side="BUY", order_type="MARKET", quantity=0.01)
    print(result)
