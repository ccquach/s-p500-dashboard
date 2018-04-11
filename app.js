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
  var extremeDates = d3.extent(data, d => d.date);
  var currentRange = 1;
  var rangeData = getRangeData(data, currentRange, extremeDates[1]);
  // debugger

  // display available data date range
  var dateFormat = d3.timeFormat("%b %d, %Y");
  d3.select("#min-date")
      .text(`${dateFormat(extremeDates[0])}`);

  d3.select("#max-date")
      .text(`${dateFormat(extremeDates[1])}`);

  // TODO: display selected date range => delegate to radio input on-change event handler
})
.catch(function(error) {
  throw error
});

function getRangeData(data, range, maxDate) {
  var minDate = new Date(maxDate);
  minDate.setMonth(maxDate.getMonth() - range);
  return data.filter(d => d.date >= minDate);
}