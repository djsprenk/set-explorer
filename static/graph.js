
// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var bar = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

var timeline = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

function barGraph(data, svg) {

    // Add a dummy index to each song entry.
    // Helps us with songs that are repeated or are missing differentiating metadata.
    for (var i = 0; i < data.length; i++) {
        data[i]["index"] = i
    }

    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return d["index"] }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 5])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Color Mapper
    colors = {
        "0": "grey",
        "1": "blue",
        "2": "green",
        "3": "yellow",
        "4": "orange",
        "5": "red"
    }

    // Bars
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d["index"]) })
        .attr("y", function (d) { return y(Number(d["Tags"]["@Stars"] || "0")); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(Number(d["Tags"]["@Stars"] || "0")) })
        .attr("fill", function (d) {
            return colors[d["Tags"]["@Stars"] || "0"]
        })
}

barGraph(song_data, bar);


function timelineGraph(data, svg) {

    timelineHeight = 20;

    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return d["index"] }))
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + timelineHeight + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scalePoint()
        .domain([0, 0])
        .range([timelineHeight, 0]);

    var yAxis = d3.axisLeft(y)
    yAxis.ticks(1)

    svg.append("g")
        .call(yAxis);

    // Color Mapper
    colors = {
        "0": "grey",
        "1": "blue",
        "2": "green",
        "3": "yellow",
        "4": "orange",
        "5": "red"
    }

    // Bars
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d["index"]) })
        // .attr("y", function (d) { return 0; })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return timelineHeight })
        .attr("fill", function (d) {
            return colors[d["Tags"]["@Stars"] || "0"]
        })

}

timelineGraph(song_data, timeline);

