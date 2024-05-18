function getEnergy (data, index) {
  return data.Energy || 0
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
    .attr('data-energy', getEnergy)
    .attr('title', getSongMeta)
}

const container = d3.select('#my_dataviz')

for (const i in songData) {
  timelineGraph(container, songData[i].data, songData[i].title)
}
