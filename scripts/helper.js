function displayReturn(data, range) {
  var maxDate = parseDateDisplay(d3.select("#max-date").node().textContent);
  var minDate = getMinDate(range, maxDate);
  var tickerData = getRangeData(data, minDate)[1];
  
  // [start, end]
  var returnArray = tickerData.reduce((acc, next) => {
    acc[0] += next.values.find(d => d.date === d3.min(next.values, d => d.date)).close;
    acc[1] += next.values.find(d => d.date === d3.max(next.values, d => d.date)).close;
    return acc;
  }, [0,0]);
  
  var dollarReturn = returnArray[1] - returnArray[0];
  var percentReturn = (returnArray[1] - returnArray[0]) / returnArray[0] * 100;
  var formatValue = d3.format(",.2f");
  d3.select("#return-display")
      .text(`$${formatValue(dollarReturn)} / ${formatValue(percentReturn)}%`);
}

function getRangeData(data, minDate) {
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

function displayDateRange(range, maxDate) {
  var minDate = getMinDate(range, maxDate);
  d3.select("#date-range-display")
      .text(`${dateFormat(minDate)} to ${dateFormat(maxDate)}`);
}

function getMinDate(range, maxDate) {
  var minDate = new Date(maxDate);
  minDate.setMonth(maxDate.getMonth() - range);
  return minDate;
}

function parseDateDisplay(d) {
  return d3.timeParse("%b %d, %Y")(d);
}

function dateFormat(d) {
  return d3.timeFormat("%b %d, %Y")(d);
}