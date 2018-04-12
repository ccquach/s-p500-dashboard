d3.csv("./data/all_stocks_5yr.csv", function(row) {
  parseDate = d3.timeParse("%Y-%m-%d");
  return {
    date: parseDate(row.date),
    open: +row.open,
    high: +row.high,
    low: +row.low,
    close: +row.close,
    volume: +row.volume,
    ticker: row.Name
  };
})
.then(function(data) {
  var minDate = d3.min(data, d => d.date);
  var maxDate = d3.max(data, d => d.date);
  var currentRange = +d3.select('input[name="date-range"]:checked').property("value");
  
  var width = d3.select(".chart-container").node().offsetWidth;
  var height = 200;

  // display available data date range
  var dateFormat = d3.timeFormat("%b %d, %Y");
  d3.select("#min-date")
      .text(`${dateFormat(minDate)}`);

  d3.select("#max-date")
      .text(`${dateFormat(maxDate)}`);

  setUpSearch(getTickers(data));
  // createPrice(width, height);
  // drawPrice(getRangeData(data, currentRange, maxDate));

  d3.select("#search")
    .on("change", () => {
      var ticker = d3.event.target.value;
      // add ticker to portfolio and remove from search list
      updateSearch(ticker);
      updatePortfolio(ticker);
    });

  // TODO: display selected date range => delegate to radio input on-change event handler
  d3.selectAll('input[name="date-range"]')
    .on("change", () => {
      currentRange = +d3.event.target.value;
      // drawPrice(getRangeData(data, currentRange, maxDate));
    });
})
.catch(function(error) {
  throw error
});

function getTickers(data) {
  var tickersNest = 
    d3.nest()
      .key(d => d.ticker)
      .entries(data);

  var tickers = [""];
  for (i in tickersNest) {
    var ticker = tickersNest[i].key;
    if (!tickers.includes(ticker)) tickers.push(ticker);
  }
  return tickers;
}

function getRangeData(data, range, maxDate) {
  var minDate = new Date(maxDate);
  minDate.setMonth(maxDate.getMonth() - range);
  return data.filter(d => d.date >= minDate);
}