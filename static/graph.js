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

function setSortOrder (order, data) {
  // Default to newest first
  if (order === null || order === 'newest') {
    return data.sort((a, b) => Date.parse(b.uploadTimestamp) - Date.parse(a.uploadTimestamp))
  } else if (order === 'oldest') {
    return data.sort((a, b) => Date.parse(a.uploadTimestamp) - Date.parse(b.uploadTimestamp))
  } else {
    console.error(`Bad sort order: ${order}`)
    return data
  }
}

// Get Query Params
const urlParams = new URLSearchParams(window.location.search)
const sortOrder = urlParams.get('order')

// Sort data
const sortedData = setSortOrder(sortOrder, songData)

for (const i in sortedData) {
  const setMetadata = {
    title: sortedData[i].title,
    thumbnail: sortedData[i].img,
    url: sortedData[i].url
  }

  const songs = sortedData[i].data
  timelineGraph(container, songs, setMetadata)
}
