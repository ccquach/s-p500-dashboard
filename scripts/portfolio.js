function updateSearch(ticker) {
  var list = d3.selectAll("option").data();
  // check if ticker is in search list
  if (list.includes(ticker)) {
    // if yes, remove ticker
    var nodes = d3.selectAll("option").nodes();
    var node = nodes.find(d => d.value === ticker);
    node.remove();
  } else {
    // if no, add ticker
    list.push(ticker);
    setUpSearch(list.sort());    
  }
}

function updatePortfolio(ticker) {
  // add ticker to portfolio
  d3.select("#portfolio")
    .append("div")
      .text(ticker)
      .on("click", () => {
        updateSearch(d3.event.target.textContent);
        d3.event.target.remove();
        // TODO: update graph
      })
}

function setUpSearch(data) {
  var update = 
    d3.select("#search")
      .selectAll("option")
      .data(data, d => d);

  update
    .exit()
    .remove();

  update
    .enter()
    .append("option")
      .property("value", d => d)
      .text(d => d);
}