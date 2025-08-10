import * as d3 from 'd3'

function e3Graph (container, songs, pois, setMetadata, index, scale) {
  // Dimensions / constant
  const graphHeight = 20
  const graphWidth = 500

  // If we are in relative length mode, scale to the length below as max
  const relativeLength = scale !== 'stretch'
  const maxSetLengthMinutes = 140
  const domainMax = relativeLength ? Math.max(maxSetLengthMinutes * 60, setMetadata.length) : setMetadata.length

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, domainMax])
    .range([0, graphWidth])

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([graphHeight, 0])

  const gradientScale = d3.scaleLinear()
    .domain([0, domainMax])
    .range([0, 100])

  function getXPos (d, i) {
    const timestamp = parseFloat(d.timestamp)
    if (isNaN(timestamp)) {
      console.warn(`NOT A NUMBER: ${JSON.stringify(d)}`)
    }
    return xScale(timestamp)
  }

  function getXMidpoint (d, i) {
    const thisTimestamp = parseFloat(cuePoints[i].timestamp)
    const nextTimestamp = i + 1 < cuePoints.length ? parseFloat(cuePoints[i + 1].timestamp) : parseFloat(setMetadata.length)
    return thisTimestamp + ((nextTimestamp - thisTimestamp) / 2)
  }

  function getYPos (d, i) {
    const effectiveBpm = Math.min(d.bpm, 1)
    return yScale(effectiveBpm)
  }

  // Add a container
  const familiarityContainer = container.append('div').attr('class', 'familiarity-container')
  familiarityContainer.append('span').attr('class', 'graph-label').text('Familiarity')

  // Build the familiarity visualization
  const familiarityVisualization = familiarityContainer
    .append('svg')
    .attr('class', 'familiarity-graph svg-content-responsive')
  // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `0 0 ${graphWidth} ${graphHeight}`)

  // Create gradient
  const gradientId = `e3-gradient-${index}`
  const gradient = familiarityVisualization.append('defs')
    .append('linearGradient')
    .attr('id', gradientId)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', graphWidth)
    .attr('y2', 0)

  // Add stops
  function addColorStop (pos, familiarity) {
    const mapper = {
      '#Educate': 'purple',
      '#Entertain': 'magenta',
      '#Expand': 'darkblue',
      Unknown: 'white',
      null: 'white',
      undefined: 'white'
    }
    gradient.append('stop')
    // .attr('offset', xScale(pos))
      .attr('offset', gradientScale(pos) + '%')
      .attr('stop-color', mapper[familiarity])
  }

  // Get just cue points from list
  function filterCues (list) {
    return list.filter(item => item.type === 'cue')
  }

  const cuePoints = filterCues(pois)

  if (cuePoints.length !== songs.length) {
    console.warn(`Mismatched song / cue length for ${setMetadata.title}`)
  }
  for (let i = 0; i < Math.min(cuePoints.length, songs.length); i++) {
    cuePoints[i].e3 = songs[i].E3
  }

  // Add color for familiarity of each song
  cuePoints.forEach((d, i) => {
    const e3 = d.e3
    const pos = getXMidpoint(d, i)
    addColorStop(pos, e3)
  })

  // console.log(`Drawing set: ${setMetadata.title}`)

  // Create the path for the familiarity graph
  const line = d3.line()
    .x((d, i) => getXPos(d, i))
    .y((d, i) => getYPos(d, i))
    .curve(d3.curveLinearClosed)

  // Close the path by filling in the corners
  const bottomLeftPoint = { timestamp: 0, bpm: 0 }
  const topLeftPoint = { timestamp: 0, bpm: 1 }
  const topRightPoint = { timestamp: setMetadata.length, bpm: 1 }
  const bottomRightPoint = { timestamp: setMetadata.length, bpm: 0 }
  const poisPoints = [bottomLeftPoint, topLeftPoint, ...pois, topRightPoint, bottomRightPoint]

  // Draw the path and add fill
  familiarityVisualization.append('path')
    .datum(poisPoints)
    .attr('d', line)
    .attr('fill', `url(#${gradientId})`)

  // Add cue point lines for each cue point
  cuePoints.forEach((d, i) => {
    const x = getXPos(d, i)
    const y1 = graphHeight
    const y2 = 0

    familiarityVisualization.append('line')
      .attr('x1', x)
      .attr('y1', y1)
      .attr('x2', x)
      .attr('y2', y2)
      .attr('class', 'cue-point')
  })
}

export { e3Graph }
