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
  
  var chartContainer = d3.select(".chart-container").node();
  var width = Math.floor(chartContainer.offsetWidth);
  var height = Math.floor(chartContainer.offsetHeight / 3);
  
  // display available data date range
  var dateFormat = d3.timeFormat("%b %d, %Y");
  d3.select("#min-date")
      .text(`${dateFormat(minDate)}`);

  d3.select("#max-date")
      .text(`${dateFormat(maxDate)}`);

  createPrice(width, height);
  createPortfolio("AAPL", data);  // default starting portfolio
  drawGraphs(data, currentRange, maxDate);
  
  d3.select(".dropdown-search")
    .on("input focus", () => {
      var tgt = d3.event.target;
      if (tgt.value) {
        createDropdown(tgt.value, data);
      }
      d3.select(".dropdown-content").classed("show", tgt.value);
    })
    // TODO: arrow key nav options list
    .on("keydown", () => {
      if (d3.event.keyCode === 40) {
        // handleKeyDown();
      }
    });

  // TODO: display selected date range => delegate to radio input on-change event handler
  d3.selectAll('input[name="date-range"]')
    .on("change", () => {
      currentRange = +d3.event.target.value;
      drawGraphs(data);
    });

  d3.select(".side-nav")
    .on("click", updateCharts);

  function updateCharts() {
    var tgt = d3.event.target;
    var tgtSelection = d3.select(tgt);
    var isOption = tgtSelection.classed("option");
    var isHolding = tgtSelection.classed("holding");
    var range = +d3.select('input[name="date-range"]:checked').property("value");
    var maxDate = parseDateDisplay(d3.select("#max-date").node().textContent);
    
    if (isOption) {
      var ticker = tgt.textContent;
      createPortfolio(ticker, data);
      d3.select(".dropdown-search").property("value", "");
      d3.select(".dropdown-content").classed("show", false);
    } else if (isHolding) {
      d3.select(tgt.remove());
    }
    if (isOption || isHolding) {
      drawGraphs(data, range, maxDate);
    }
  }
})
.catch(function(error) {
  throw error
});

function drawGraphs(data, range, maxDate) {
  var dataArray = getRangeData(data, range, maxDate);
  var dateRange = dataArray[0];
  var rangeData = dataArray[1];
  drawPrice(dateRange, rangeData);
}

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
  // get min range date
  var minDate = new Date(maxDate);
  minDate.setMonth(maxDate.getMonth() - range);

  // get portfolio tickers
  var tickers = d3.selectAll(".holding").data();
  
  // filter data
  var rangeData = [];
  for (var i = 0; i < tickers.length; i++) {
    data.filter(d => d.ticker === tickers[i] && d.date >= minDate).reduce((acc, next) => {
      acc.push(next);
      return acc;
    }, rangeData);
  }
  
  // group data
  var groupedData = 
    d3.nest()
      .key(d => d.ticker)
      .entries(rangeData);
  return [d3.extent(rangeData, d => d.date), groupedData];
}

function parseDateDisplay(d) {
  return d3.timeParse("%b %d, %Y")(d);
}