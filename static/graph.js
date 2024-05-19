function getEnergy (data, index) {
  return data.Energy || 0
}

function getSongMeta (data, index) {
  const artist = data.Artist || 'Unknown'
  const title = data.Title || 'Unknown'
  return `${artist} - ${title}`
}

function timelineGraph (container, songs, setMetadata) {
  if (setMetadata.thumbnail) {
    const thumbnail = container
      .append('a')
      .attr('class', 'set-thumbnail-link')
      .attr('href', setMetadata.url)
      .append('img')
      .attr('class', 'set-thumbnail')
      .attr('src', setMetadata.thumbnail)
      .attr('title', setMetadata.title)
  }

  const title = container
    .append('a')
    .attr('class', 'set-title')
    .text(setMetadata.title)

  if (setMetadata.url !== '') {
    title.attr('href', setMetadata.url)
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
  const setMetadata = {
    title: songData[i].title,
    thumbnail: songData[i].img,
    url: songData[i].url
  }

  const songs = songData[i].data
  timelineGraph(container, songs, setMetadata)
}
