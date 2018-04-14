function drawPrice(range, tickers) {
  // TODO: d3.area? https://github.com/d3/d3-shape#curves
  console.log(tickers);
  var svg = d3.select("svg");
  var padding = {
    top: 15,
    right: 40,
    bottom: 30,
    left: 50
  };
  var width = +svg.attr("width");
  var height = +svg.attr("height");

  // format data
  tickers.forEach(ticker => {
    ticker.values = ticker.values.reduce((acc, next) => {
      acc.push({ date: next.date, close: next.close });
      return acc;
    }, []);
  })
  
  // axis
  var xScale =
    d3.scaleTime()
      .domain(range)
      .rangeRound([padding.left, width - padding.right]);

  var yScale =
    d3.scaleLinear()
      .domain([
        d3.min(tickers, t => d3.min(t.values, d => d.close)),
        d3.max(tickers, t => d3.max(t.values, d => d.close))
      ])
      .range([height - padding.bottom, padding.top]);
      
  var zScale =
    d3.scaleOrdinal(d3.schemeCategory10)
      .domain(tickers.map(d => d.key));

  d3.select(".x-axis")
      .attr("transform", `translate(0, ${height - padding.bottom})`)
      .call(d3.axisBottom(xScale));

  d3.select(".y-axis")
      .attr("transform", `translate(${padding.left}, 0)`)
      .call(d3.axisLeft(yScale));

  d3.select(".y-axis-label")
      .attr("x", -padding.top)
      .text("Price ($)");
      
  // draw graph
  var t =
    d3.transition()
      .duration(1000);

  var line =
    d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.close));

  var update =
    svg
      .selectAll(".group")
      .data(tickers, d => d.key);
  
  // update
  update
    .selectAll(".line")
    .transition(t)
    .attr("d", d => line(d.values))
    .style("stroke", d => zScale(d.key));

  update
    .selectAll(".label")
    .transition(t)
    .attr("transform", d => `translate(${xScale(d.value.date)}, ${yScale(d.value.close)})`);

  // exit
  update
    .exit()
    .transition(t)
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
      d.totalLength = this.getTotalLength()
    })
    .attr("stroke-dasharray", d => d.totalLength + " " + d.totalLength)
    .attr("stroke-dashoffset", d => d.totalLength)
    .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
    .on("end", () => {
      labels
        .transition()
        .delay(function(d, i) { return i * 250; })
        .style("opacity", 1);
    });

  var labels =
    tickerGrp
      .append("text")
      .datum(function(d) { return {key: d.key, value: d.values[d.values.length - 1]} })
        .classed("label", true)
        .attr("transform", d => `translate(${xScale(d.value.date)}, ${yScale(d.value.close)})`)
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("stroke", d => zScale(d.key))
        .style("opacity", 0)
        .text(d => d.key);
}