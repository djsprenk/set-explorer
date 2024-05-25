function getEnergy (data, index) {
  return data.Energy || 0
}

function getSongMeta (data, index) {
  const artist = data.Artist || 'Unknown'
  const title = data.Title || 'Unknown'
  return `${artist} - ${title}`
}

function getSetTitleSubtitle (longformTitle) {
  titleParts = longformTitle.split(' | ')

  if (titleParts.length >= 2) {
    return [titleParts[0], titleParts[1]]
  } else {
    return [longformTitle, '']
  }
}

function timelineGraph (container, songs, setMetadata) {
  if (setMetadata.img) {
    const thumbnail = container
      .append('a')
      .attr('class', 'set-thumbnail-link')
      .attr('href', setMetadata.url)
      .append('img')
      .attr('class', 'set-thumbnail')
      .attr('src', setMetadata.img)
      .attr('title', setMetadata.title)
  }

  const title = container
    .append('div')
    .attr('class', 'set-title')

  // Split title into name and subtitle
  let setName, setSubtitle;
  [setName, setSubtitle] = getSetTitleSubtitle(setMetadata.title)

  title.append('div')
    .attr('class', 'set-name')
    .text(setName)

  title.append('div')
    .attr('class', 'set-subtitle')
    .text(setSubtitle)

  if (setMetadata.url !== '') {
    title.attr('href', setMetadata.url)
  }

  // Add set BPM
  const bpm = container
    .append('div')
    .attr('class', 'bpm')

  if (setMetadata.bpmMin && setMetadata.bpmMax) {
    bpm.text(`${Math.round(setMetadata.bpmMin)} - ${Math.round(setMetadata.bpmMax)} BPM`)
  }

  // Build the timeline group
  const timeline = container
    .append('div')
    .attr('class', 'timeline')

  // Map data to divs
  const song = timeline.selectAll('div')
    .data(songs)
    .join('div')
    .attr('class', 'song')

    // Block order is the index
    .style('order', function (d, i) { return i })

    // Color the rectangles with their energies
    .attr('data-energy', getEnergy)
    .attr('title', getSongMeta)

  // Add tooltip section
  const tooltip = container
    .append('div')
    .attr('class', 'song-tooltip invisible')

    // Placeholder text to avoid layout shift
    .text('---')

  song.on('mouseover click', function (d, i) {
    // Mark the song as selected
    container.selectAll('.song')
      .attr('class', 'song')

    song.attr('class', 'song selected')

    // Hide all other tooltips
    container.selectAll('.song-tooltip')
      .attr('class', 'song-tooltip invisible')

    // Show this tooltip
    tooltip.attr('data-energy', getEnergy(d, i))
      .text(`${d.Title || 'Unknown'} by ${d.Artist || 'Unknown'}`)
      .attr('class', 'song-tooltip')
  })
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
  const songs = sortedData[i].data
  const setMetadata = sortedData[i]
  delete setMetadata.data

  timelineGraph(container, songs, setMetadata)
}
