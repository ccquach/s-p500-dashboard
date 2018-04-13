function createDropdown(val, data) {
  var tickers = getTickers(data);
	const regex = new RegExp(escapeRegex(val), 'gi');
	var options = tickers.filter(ticker => ticker.match(regex));
	
	var update = 
		d3.select(".dropdown-content")
			.selectAll(".option")
			.data(options, d => d);
	
	update
		.exit()
		.remove();
	
	update
		.enter()
		.append("li")
			.classed("option", true)
		.merge(update)
			.text(d => d);
}

function createPortfolio(ticker, data) {
  var portfolio = d3.selectAll(".holding").data();
  // don't add ticker if already in portfolio
	if (!portfolio.includes(ticker)) {
		portfolio.push(ticker);
		d3.select(".portfolio-content")
			.selectAll(".holding")
			.data(portfolio, d => d)
			.enter()
			.append("li")
				.classed("holding", true)
				.text(d => d)
	}
}

// function handleKeyDown() {
// 	var active = d3.select(".active");
// 	debugger
// 	if (!active) {
// 		d3.select(".option")
// 				.classed("active", true);
// 	}
// }

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};