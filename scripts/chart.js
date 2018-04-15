function createChart(width, height) {
  var svg =
    d3.select("svg")
        .attr("width", width)
        .attr("height", height);
  
  svg
    .append("g")
      .classed("x-axis", true);

  svg
    .append("g")
      .classed("y-axis", true)
    .append("text")
      .classed("y-axis-label", true)
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end");
}

function drawGraph(data, range, type) {
  // TODO: d3.area? https://github.com/d3/d3-shape#curves
  // console.log(tickers);
  var maxRange = parseDateDisplay(d3.select("#max-date").node().textContent);
  var minRange = getMinDate(range, maxRange);
  var rangeData = getRangeData(data, minRange, maxRange);
  var dateRange = rangeData[0];
  var svg = d3.select("svg");
  var padding = {
    top: 15,
    right: 40,
    bottom: 30,
    left: 50
  };
  var width = +svg.attr("width");
  var height = +svg.attr("height");
  var tickerData = formatData(rangeData[1], type);
  
  // axis
  var xScale =
    d3.scaleTime()
      .domain(dateRange)
      .rangeRound([padding.left, width - padding.right]);

  var yScale =
    d3.scaleLinear()
      .domain([
        d3.min(tickerData, t => d3.min(t.values, d => d.amount)),
        d3.max(tickerData, t => d3.max(t.values, d => d.amount))
      ])
      .range([height - padding.bottom, padding.top]);
      
  var zScale =
    d3.scaleOrdinal(d3.schemeCategory10)
      .domain(tickerData.map(d => d.key));

  var axisT =
    d3.transition()
      .duration(1000)
      .ease(d3.easeExpInOut)

  d3.select(".x-axis")
      .attr("transform", `translate(0, ${height - padding.bottom})`)
      .transition(axisT)
      .call(d3.axisBottom(xScale));

  var yAxis = type === "price" ?
    d3.axisLeft(yScale) :
    d3.axisLeft(yScale).tickFormat(d3.format(".1f"));

  d3.select(".y-axis")
      .attr("transform", `translate(${padding.left}, 0)`)
      .transition(lineT)
      .call(yAxis);

  var axisLabel = type === "price" ? "Price ($)" : "Return (%)";
  d3.select(".y-axis-label")
      .attr("x", -padding.top)
      .text(axisLabel);
      
  // draw graph
  var lineT =
    d3.transition()
      .duration(1000);

  var line =
    d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.amount));

  var update =
    svg
      .selectAll(".group")
      .data(tickerData, d => d.key);
  
  // update
  update.select(".line")
    .transition(lineT)
      .attr("stroke-dasharray", null)
      .attr("d", d => line(d.values));
        

  update.select(".label")
    .datum(function(d) { return {key: d.key, value: d.values[d.values.length - 1]} })
    .transition(lineT)
      .attr("transform", d => `translate(${xScale(d.value.date)}, ${yScale(d.value.amount)})`);

  // exit
  update
    .exit()
    .transition(lineT)
      .style("opacity", 0)
      .remove();

  // enter
  var tickerGrp =
    update
      .enter()
      .append("g")
        .classed("group", true);

  var path =
    tickerGrp
      .append("path")
        .classed("line", true)
        .attr("d", d => line(d.values))
        .style("stroke", d => zScale(d.key));
  
  path
    .each(function(d) {
      d.totalLength = this.getTotalLength();
    })
    .attr("stroke-dasharray", d => d.totalLength + " " + d.totalLength)
    .attr("stroke-dashoffset", d => d.totalLength)
    .transition()
      .on("start", () => {
        d3.select(".dropdown-search").attr("disabled", true);
        d3.selectAll("select").attr("disabled", true);
        d3.selectAll(".holding").style("pointer-events", "none");
      })
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
    .on("end", () => {
      labels
        .transition()
        .delay(function(d, i) { return i * 250; })
        .style("opacity", 1)
        .on("end", () => {
          d3.select(".dropdown-search").attr("disabled", null);
          d3.selectAll("select").attr("disabled", null);
          d3.selectAll(".holding").style("pointer-events", null);
        });
    });

  var labels =
    tickerGrp
      .append("text")
      .datum(function(d) { return {key: d.key, value: d.values[d.values.length - 1]} })
        .classed("label", true)
        .attr("transform", d => `translate(${xScale(d.value.date)}, ${yScale(d.value.amount)})`)
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("stroke", d => zScale(d.key))
        .style("opacity", 0)
        .text(d => d.key);
}

function formatData(tickers, type) {
  tickers.forEach(ticker => {
    var minDate = d3.min(ticker.values, d => d.date);
    var minDateClose = ticker.values.find(d => d.date === minDate).close;
    ticker.values = ticker.values.reduce((acc, next) => {
      var val = type === "return" ?
        val = (next.close - minDateClose) / minDateClose * 100 :
        val = next.close;
      acc.push({ 
        date: next.date, 
        amount: val 
      });
      return acc;
    }, []);
  })
  return tickers;
}

function getRangeData(data, minDate, maxDate) {
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