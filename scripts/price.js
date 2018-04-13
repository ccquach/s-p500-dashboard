function createPrice(width, height) {
  var price =
    d3.select("#price")
        .attr("width", width)
        .attr("height", height);
  
  price
    .append("g")
      .classed("x-axis", true);

  price
    .append("g")
      .classed("y-axis", true)
    .append("text")
      .classed("y-axis-label", true)
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");
}

function drawPrice(range, tickers) {
  // TODO: d3.area? https://github.com/d3/d3-shape#curves
  console.log(tickers);
  var price = d3.select("#price");
  var padding = {
    top: 15,
    right: 30,
    bottom: 30,
    left: 50
  };
  var width = +price.attr("width");
  var height = +price.attr("height");

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
      
  // draw graph
  var t =
      d3.transition()
        .duration(1000);

  var line =
    d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.close));

  var update =
    price
      .selectAll(".ticker-price")
      .data(tickers, d => d.key);

  // TODO: transition line fading out
  update
    .exit()
    // .transition(t)
    // .attr("d", "M0 0")
    .remove();

  var tickerGrp =
    update
      .enter()
      .append("g")
        .classed("ticker-price", true);

  // var path =
  tickerGrp
    .append("path")
      .classed("line", true)
    .merge(price.selectAll(".line"))
      .transition(t)
        .attr("d", d => line(d.values))
        .style("stroke", d => zScale(d.key));

  // var totalLength = path.node().getTotalLength();
  // debugger
  // path
  //     .attr("stroke-dasharray", totalLength+","+totalLength)
  //     .attr("stroke-dashoffset", totalLength)
  //     .transition()
  //     .duration(2000)
  //     .ease("linear-in-out")
  //     .attr("stroke-dashoffset", 0);
}