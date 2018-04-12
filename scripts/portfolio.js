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
			.on("click", () => {
				var ticker = d3.event.target.textContent;
				createPortfolio(ticker);
				d3.select(".dropdown-search").property("value", "");
				d3.select(".dropdown-content").classed("show", false);
			})
		.merge(update)
			.text(d => d);
}

function createPortfolio(ticker) {
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
				.on("click", function() {
					d3.select(this).remove();
				});
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