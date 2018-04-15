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