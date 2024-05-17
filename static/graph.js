function mapColor (data, index) {
  // Colors for different energy values
  const colors = {
    0: 'grey',
    1: 'blue',
    2: 'green',
    3: 'yellow',
    4: 'orange',
    5: 'red'
  }

  return colors[data.Energy || '0']
}

function getSongMeta (data, index) {
  const artist = data.Artist || 'Unknown'
  const title = data.Title || 'Unknown'
  return `${artist} - ${title}`
}

function timelineGraph (timelineContainer, data, title) {
  const timelineWidth = 500
  const timelineHeight = 20
  const elementWidth = Math.min(20, timelineWidth / data.length)

  // Add title
  timelineContainer
    .append('div')
    .text(title)
    .style('display', 'inline-block')
    .style('padding', '20px')

  // Build the timeline group
  const timeline = timelineContainer
    .append('svg')
    .attr('width', timelineWidth)
    .attr('height', timelineHeight)
    .append('g')

  // Map data to rectangles
  timeline.selectAll('rect')
    .data(data)
    .join('rect')

  // Block X values are just multiples of width
    .attr('x', function (d, i) {
      return i * elementWidth
    })

  // Entry should display as a square, equal height / width
    .attr('width', elementWidth)
    .attr('height', timelineHeight)

  // Since this is a horizontal timeline, Y value is always 0
    .attr('y', 0)

  // Color the rectangles with their energies
    .style('fill', mapColor)
    .style('stroke', 'white')
    .style('stroke-width', '1px')
    .text(getSongMeta)

  // Hover Effects
  // Source: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
        .duration('50')
        .attr('opacity', '.75')
        .style('stroke-width', '4px')
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1')
        .style('stroke-width', '1px')
    })

  // Add break to give space between graphs
  timelineContainer.append('br')
}

const container = d3.select('#my_dataviz')

for (const i in songData) {
  timelineGraph(container, songData[i].data, songData[i].title)
}
