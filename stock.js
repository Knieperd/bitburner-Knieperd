/**  @author = Knieperd - Version 1.0
First argument = At what price you want to sell. If you do not want to use
this function just put a number above REALLY high. (You don't have to use this!)
Second argument = How much money you want to keep on your bank. I recommend
to put this above 100.000.000

Have fun making free money :D. The more money you have on your bank, the more it will generate
**/

/** @param {NS} ns **/
export async function main(ns) {

	function buy_stock(stockname, percent) {
		var current_price = ns.stock.getAskPrice(stockname)
		var stonks = Math.round((money * percent / current_price - 1))

		if (stonks > ns.stock.getMaxShares(stockname)) {
			stonks = ns.stock.getMaxShares(stockname)
		}
		ns.stock.buy(stockname, stonks)
		profit = profit - Math.round(current_price * stonks)
		ns.tprint("Bought " + stonks + " stocks from " + stockname + " for " + Math.round(current_price) + " each. Total: " + Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Math.round(current_price * stonks)))
	}

	function sell_stock(stockname, amount) {
		var current_price = ns.stock.getBidPrice(stockname)
		ns.stock.sell(stockname, amount)
		profit = profit + Math.round(current_price * amount)
		ns.tprint("Sold " + amount + " stocks from " + stockname + " for " + Math.round(current_price) + " each. Total:  " + Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Math.round(current_price * amount)))
	}


	var min_profit = ns.args[0]
	var money_keep = ns.args[1]
	var money = (ns.getServerMoneyAvailable("home") - money_keep)
	var all_stocks = ns.stock.getSymbols()

	var potential_profit = 0
	var potential = []
	var buy_prices = []

	var profit = 0
	
	while (true) {
		potential = []
		buy_prices = []
		for (var i = 0; i < all_stocks.length; i++) {
			var temp = ns.stock.getForecast(all_stocks[i])
			if (temp > 0.6) {
				potential.push(all_stocks[i])
			}
		}

		ns.tprint("Stocks with grow potential: " + potential)

		money = (ns.getServerMoneyAvailable("home") - money_keep)
		var percent = 100 / potential.length / 100

		var change = false

		if (potential.length == 0) {
			await ns.asleep(6000)
			change = true
		}
		while (!change) {
			await ns.asleep(6000)
			for (var i = 0; i < potential.length; i++) {
				var position = ns.stock.getPosition(potential[i])
				if (position[0] == 0) { //buy if we have no stock
					buy_stock(potential[i], percent)
					position = ns.stock.getPosition(potential[i])
					buy_prices.push(position[1])
				}

				position = ns.stock.getPosition(potential[i])
				var potential_profit = Math.round(ns.stock.getBidPrice(potential[i]) * position[0]) - (Math.round(position[0] * position[1]))
				ns.print("Potential profit for " + potential[i] + " is: " + Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Math.round(potential_profit)))

				if (potential_profit > min_profit) { //sell if the profit is good enough
					if (!(position[0] == ns.stock.getMaxShares([potential[i]]))) {
						sell_stock(potential[i], position[0])
						buy_stock(potential[i], percent)
						buy_prices.splice(i, 1)
					}
				}

				if (ns.stock.getForecast(potential[i]) < 0.5) {
					change = true
				}
			}
		}
		ns.tprint("Ohno! Quick, lets sell!")
		for (var i = 0; i < potential.length; i++) { //panic sell if shit goes down
			var position = ns.stock.getPosition(potential[i])
			sell_stock(potential[i], position[0])
		}
		ns.tprint("Total profit: " + Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(profit))
	}
}
