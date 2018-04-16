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
  var currentRange = +d3.select("#date-range").property("value");
  var currentChartType = d3.select("#chart-type").property("value");
  
  var chartContainer = d3.select(".chart-container").node();
  var width = Math.floor(chartContainer.offsetWidth);
  var height = Math.floor(chartContainer.offsetHeight);
  
  // display available data date range
  d3.select("#min-date")
      .text(`${dateFormat(minDate)}`);

  d3.select("#max-date")
      .text(`${dateFormat(maxDate)}`);

  displayDateRange(currentRange, maxDate);
  createChart(width, height);
  createPortfolio("AAPL", data);  // default starting portfolio
  drawGraph(data, currentRange, currentChartType);
  displayReturn(data, currentRange);

  // user input handlers
  d3.select("#date-range")
    .on("change", () => {
      currentRange = +d3.event.target.value;
      displayDateRange(currentRange, maxDate);
      drawGraph(data, currentRange, currentChartType);
      displayReturn(data, currentRange);
    });

  d3.select("#chart-type")
    .on("change", () => {
      currentChartType = d3.event.target.value;
      drawGraph(data, currentRange, currentChartType);
    })
  
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

  d3.select(".side-nav")
    .on("click", updateCharts);

  function updateCharts() {
    var tgt = d3.event.target;
    var tgtSelection = d3.select(tgt);
    var isOption = tgtSelection.classed("option");
    var isHolding = tgtSelection.classed("holding");
    var range = +d3.select("#date-range").property("value");
    
    if (isOption) {
      var ticker = tgt.textContent;
      createPortfolio(ticker, data);
      d3.select(".dropdown-search").property("value", "");
      d3.select(".dropdown-content").classed("show", false);
    } else if (isHolding) {
      d3.select(tgt.remove());
    }
    if (isOption || isHolding) {
      drawGraph(data, range, currentChartType);
      displayReturn(data, range);
    }
  }
})
.catch(function(error) {
  throw error
});