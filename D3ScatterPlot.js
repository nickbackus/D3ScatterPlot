let req = new XMLHttpRequest (), dataSet;
req.open ("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", true);
req.send();
req.onload = () => {
  json = JSON.parse(req.responseText)
  renderData(json)
}

let renderData = (JSONdata) => {
  let padding = 35, w = 700, h = 400 , colors = [["orange", "Bicyclists With Doping Allegations"], ["blue", "Bicyclists Without Doping Allegations"]];
  
  let data = JSONdata.map(item => {
    return {...item, Year: d3.utcParse("%Y")(item.Year), FinishTime: d3.utcParse("%s")(item.Seconds)};
  });
  
  let utcYear = d3.utcFormat("%Y");
  let utcFinishTime = d3.utcFormat("%M:%S");
  
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("class", "");
  
  const xScale = d3.scaleUtc()
    .domain(d3.extent(data, d=> d.Year.getUTCFullYear()).map(d=>d3.utcParse("%Y")(d)))
    .range([padding, w - padding]);
  
  const yScale = d3.scaleUtc()
    .domain(d3.extent(data, d=> d.Seconds).map(d=>d3.utcParse("%s")(d)))
    .range([padding, h - padding])
 
  const xAxis = d3.axisBottom(xScale)
  
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(utcFinishTime)
    .tickPadding(2)
    .tickSizeInner(4)
  
  let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip bg-light text-center p-1 shadow")
    .style("opacity", 0)
    .html("<div id='tooltip' data-date=" + utcYear(data[0].Year) + "></div>");

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => xScale(d.Year))
    .attr("cy", (d, i) => yScale(d.FinishTime))
    .attr("r", 5)
    .attr("class", ((d, i) => (d.Doping?"clean":"dirty") + " dot"))
    .attr("data-xvalue", (d, i) => d.Year)
    .attr("data-yvalue", (d, i) => d.FinishTime)
    .on("mouseover", d => {      
      tooltip.transition()        
        .duration(300)      
        .style("opacity", .9)
      tooltip.html("<div id='tooltip' data-year=" + utcYear(d.Year) + "><div class=''>" + d.Name + ": " + d.Nationality + "</div><div class=''>" + "Year: " + utcYear(d.Year) + ", Time: " + utcFinishTime(d.FinishTime) + "</div></div>")
        .style("left", (d3.event.pageX + 10) + "px")     
        .style("top", (d3.event.pageY - 30) + "px")
    })                 
    .on("mouseout", d => {       
      tooltip.transition()        
        .duration(300)      
        .style("opacity", 0)
        .on("end", tooltip.transition().delay(300).style("top", "0px"));
    }); 
  
  svg.append("g")
    .attr("transform", "translate(0," + (h - padding +5) + ")")
    .attr("id", "x-axis")
    .call(xAxis)
  
  svg.append("g")
    .attr("transform", "translate(" + (padding -5)+ ", 0)")
    .attr("id", "y-axis")
    .call(yAxis)

  let legend = svg.append("g")
    .attr("class", "legend")
    .attr("id", "legend")

  legend.selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("x", w - 300)
    .attr("y", (d, i) => 40 + (i * 30))
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", (d, i) => {
      //This is kinda hacky but it works 
      legend.append("text")
      .text(d[1])
      .attr("x", w - 285)
      .attr("y", 50 + i * 30)
      return d[0];
    });

}
