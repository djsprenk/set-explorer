
// Colors for different energy values
const colors = {
    "0": "grey",
    "1": "blue",
    "2": "green",
    "3": "yellow",
    "4": "orange",
    "5": "red"
}

function timelineGraph(data, title) {

    var timelineMargin = { top: 20, right: 20, bottom: 20, left: 20 },
        timelineWidth = 460 - timelineMargin.left - timelineMargin.right,
        timelineHeight = 20,
        elementWidth = 20;

    var timelineContainer = d3.select("#my_dataviz");

    var timelineTitle = timelineContainer
        .append("div")
        .text(title)

        // Some sneaky to get this to align with the SVG
        .style("display", "inline-block")
        .style("vertical-align", "top")
        .style("padding-top", "24px");

    var timeline = timelineContainer
        .append("svg")
        .attr("width", timelineWidth + timelineMargin.left + timelineMargin.right)
        .attr("height", timelineHeight + timelineMargin.top + timelineMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + timelineMargin.left + "," + timelineMargin.top + ")");

    // Map data to rectangles
    timeline.selectAll("rect")
        .data(data)
        .join("rect")

        // Block X values are just multiples of width
        .attr("x", function(d, i) {
            return i * elementWidth
        })

        // Entry should display as a square, equal height / width
        .attr("width", elementWidth)
        .attr("height", elementWidth)

        // Since this is a horizontal timeline, Y value is always 0
        .attr("y", 0)

        // Color the rectangles with their energies
        .style("fill", function(d,i) {
            return colors[d["Tags"]["@Stars"] || "0"]
        })
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .text(function(d) {
            return d["Tags"]["@Title"] || "UNKNOWN"
        })

        // Hover Effects
        // Source: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.75')
                .style("stroke-width", "4px")
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1')
                .style("stroke-width", "1px");
        })
}

timelineGraph(song_data, set_title)