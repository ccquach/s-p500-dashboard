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