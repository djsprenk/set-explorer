function getEnergy (data, index) {
  return data.Energy || 0
}

function getSongMeta (data, index) {
  const artist = data.Artist || 'Unknown'
  const title = data.Title || 'Unknown'
  return `${artist} - ${title}`
}

function getSetTitleSubtitle (longformTitle) {
  const titleParts = longformTitle.split(' | ')

  if (titleParts.length >= 2) {
    return [titleParts[0], titleParts[1]]
  } else {
    return [longformTitle, '']
  }
}

function createThumbnail (container, setMetadata) {
  let thumbnail

  if (setMetadata.img) {
    thumbnail = container
      .append('a')
      .attr('class', 'set-thumbnail-link')
      .attr('href', setMetadata.url)
      .append('img')
      .attr('class', 'set-thumbnail')
      .attr('src', setMetadata.img)
      .attr('title', setMetadata.title)
  }

  return thumbnail
}

function createTitle (container, setMetadata) {
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

  return title
}

function createBpmLabel (container, setMetadata) {
  const bpm = container
    .append('div')
    .attr('class', 'bpm')

  if (setMetadata.bpmMin && setMetadata.bpmMax) {
    bpm.text(`${Math.round(setMetadata.bpmMin)} - ${Math.round(setMetadata.bpmMax)} BPM`)
  }

  return bpm
}

function timelineGraph (container, songs, setMetadata) {
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

function poisGraph (container, songs, pois, setMetadata) {
  // Dimensions / constant
  const graphHeight = 50
  const graphWidth = 400
  const graphMinBpm = 60
  const graphMaxBpm = 90

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, setMetadata.length])
    .range([0, graphWidth])

  const yScale = d3.scaleLinear()
    .domain([graphMinBpm, graphMaxBpm])
    .range([graphHeight, 0])

  function getXPos (d, i) {
    const timestamp = parseFloat(d.timestamp)
    console.log(`${timestamp}: to x coordinate: ${xScale(timestamp)}`)
    if (isNaN(timestamp)) {
      console.log(`NOT A NUMBER: ${JSON.stringify(d)}`)
    }
    return xScale(timestamp)
  }

  function getYPos (d, i) {
    const effectiveBpm = d.bpm
    if (isNaN(effectiveBpm)) {
      console.warn(`BPM is NaN: ${d.stringify()}`)
    }
    console.log(`${effectiveBpm}: to y coordinate: ${yScale(effectiveBpm)}`)
    return yScale(effectiveBpm)
  }

  // Build the timeline group
  const timeline = container
    .append('svg')
    .attr('class', 'poi-timeline')
    .attr('width', 500)
    .attr('height', 50)

  console.log(`Drawing set: ${setMetadata.title}`)
  const line = d3.line()
    .x((d, i) => getXPos(d, i))
    .y((d, i) => getYPos(d, i))
    .curve(d3.curveLinearClosed)

  const bottomLeftPoint = { timestamp: 0, bpm: graphMinBpm }
  const finalBpm = { timestamp: setMetadata.length, bpm: pois[pois.length - 1].bpm }
  const bottomRightPoint = { timestamp: setMetadata.length, bpm: graphMinBpm }
  const poisPoints = [bottomLeftPoint, ...pois, finalBpm, bottomRightPoint]

  const path = timeline.append('path')
    .datum(poisPoints) // Binds data to the path element
    .attr('d', line) // Calls the line generator with the data
    .attr('fill', 'red')
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
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
  const pois = sortedData[i].pois
  const setMetadata = sortedData[i]
  delete setMetadata.data
  delete setMetadata.pois

  // Create set header
  createThumbnail(container, setMetadata)
  createTitle(container, setMetadata)
  createBpmLabel(container, setMetadata)

  if (pois !== undefined) {
    poisGraph(container, songs, pois, setMetadata)
  } else {
    timelineGraph(container, songs, setMetadata)
  }
}
