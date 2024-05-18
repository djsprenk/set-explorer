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

function mapHeight (data, index) {
  return `${Math.max(data.Energy, 1) * 4}px`
}

function getSongMeta (data, index) {
  const artist = data.Artist || 'Unknown'
  const title = data.Title || 'Unknown'
  return `${artist} - ${title}`
}

function timelineGraph (container, data, title) {
  // Add flexbox container for timeline
  const timelineContainer = container
    .append('div')
    .attr('class', 'timeline-container')

  // Add set title
  timelineContainer
    .append('div')
    .attr('class', 'title')
    .text(title)

  // Build the timeline group
  const timeline = timelineContainer
    .append('div')
    .attr('class', 'timeline')

  // Map data to divs
  timeline.selectAll('div')
    .data(data)
    .join('div')
    .attr('class', 'song')

  // Block order is the index
    .style('order', function (d, i) { return i })

  // Color the rectangles with their energies
    .style('background-color', mapColor)
    .style('height', mapHeight)
    .attr('title', getSongMeta)
}

const container = d3.select('#my_dataviz')

for (const i in songData) {
  timelineGraph(container, songData[i].data, songData[i].title)
}
