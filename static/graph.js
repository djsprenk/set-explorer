function getEnergy (data, index) {
  return data.Energy || 0
}

function getSongMeta (data, index) {
  const artist = data.Artist || 'Unknown'
  const title = data.Title || 'Unknown'
  return `${artist} - ${title}`
}

function timelineGraph (container, songs, setTitle, url) {
  const title = container
    .append('a')
    .attr('class', 'set-title')
    .text(setTitle)

  if (url !== '') {
    title.attr('href', url)
  }

  // Build the timeline group
  const timeline = container
    .append('div')
    .attr('class', 'timeline')

  // Map data to divs
  timeline.selectAll('div')
    .data(songs)
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
  timelineGraph(container, songData[i].data, songData[i].title, songData[i].url)
}
