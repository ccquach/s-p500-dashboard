function drawGraph(data, range, maxDate, type) {
  debugger
  var dataArray = getRangeData(data, range, maxDate);
  var dateRange = dataArray[0];
  var rangeData = dataArray[1];
  if (type === "price") drawPrice(dateRange, rangeData);
  else drawReturn(dateRange, rangeData);
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
  var minDate = getMinDate(range, maxDate);

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

function getMinDate(range, maxDate) {
  var minDate = new Date(maxDate);
  minDate.setMonth(maxDate.getMonth() - range);
  return minDate;
}

function parseDateDisplay(d) {
  return d3.timeParse("%b %d, %Y")(d);
}