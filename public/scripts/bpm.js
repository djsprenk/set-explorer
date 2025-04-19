import * as d3 from 'd3'

function bpmGraph (container, songs, pois, setMetadata, index, scale) {
  // Dimensions / constant
  const graphHeight = 50
  const graphWidth = 500
  const graphMinBpm = 50
  const graphMaxBpm = 100

  // If we are in relative length mode, scale to the length below as max
  const relativeLength = scale !== 'stretch'
  const maxSetLengthMinutes = 140
  const domainMax = relativeLength ? Math.max(maxSetLengthMinutes * 60, setMetadata.length) : setMetadata.length

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, domainMax])
    .range([0, graphWidth])

  const yScale = d3.scaleLinear()
    .domain([graphMinBpm, graphMaxBpm])
    .range([graphHeight, 0])

  // Gradient stops are a percentage from 0 to 100
  const gradientScale = d3.scaleLinear()
    .domain([graphMinBpm, graphMaxBpm])
    .range([0, 100])

  function getXPos (d, i) {
    const timestamp = parseFloat(d.timestamp)
    if (isNaN(timestamp)) {
      console.warn(`NOT A NUMBER: ${JSON.stringify(d)}`)
    }
    return xScale(timestamp)
  }

  function getYPos (d, i) {
    const effectiveBpm = d.bpm
    if (isNaN(effectiveBpm)) {
      console.warn(`BPM is NaN: ${d.stringify()}`)
    }
    return yScale(effectiveBpm)
  }

  // Create a container
  const bpmContainer = container.append('div').attr('class', 'bpm-container')

  // Add a label
  bpmContainer.append('span').attr('class', 'graph-label').text('BPM')

  // Build the BPM graph
  const bpmGraph = bpmContainer
    .append('svg')
    .attr('class', 'bpmGraph svg-content-responsive')
  // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `0 0 ${graphWidth} ${graphHeight}`)

  // Create vertical gradient
  const gradientId = `gradient-bpm-${index}`
  const gradient = bpmGraph.append('defs')
    .append('linearGradient')
    .attr('id', gradientId)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', graphHeight)
    .attr('x2', 0)
    .attr('y2', 0)

  // Create color stops
  const mapper = {
    0: 'black',
    50: 'purple',
    60: 'blue',
    70: 'green',
    75: 'yellow',
    80: 'orange',
    85: 'red'
  }

  // Add stops
  for (const i in mapper) {
    const bpm = i
    const color = mapper[i]

    // console.log(`Adding stop for ${bpm} at ${gradientScale(bpm)}: ${color}`)
    gradient.append('stop')
    // .attr('offset', xScale(pos))
      .attr('offset', gradientScale(bpm) + '%')
      .attr('stop-color', color)
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
    cuePoints[i].energy = songs[i].Energy
  }

  // Create the path for the BPM graph
  const line = d3.line()
    .x((d, i) => getXPos(d, i))
    .y((d, i) => getYPos(d, i))
    .curve(d3.curveLinearClosed)

  // Close the path by filling in the corners
  const bottomLeftPoint = { timestamp: 0, bpm: graphMinBpm }
  const finalBpm = { timestamp: setMetadata.length, bpm: pois[pois.length - 1].bpm }
  const bottomRightPoint = { timestamp: setMetadata.length, bpm: graphMinBpm }
  const poisPoints = [bottomLeftPoint, ...pois, finalBpm, bottomRightPoint]

  // Draw the path and add fill
  bpmGraph.append('path')
    .datum(poisPoints)
    .attr('d', line)
    .attr('fill', `url(#${gradientId})`)

  // Add cue point lines for each cue point
  cuePoints.forEach((d, i) => {
    const x = getXPos(d, i)
    const y1 = getYPos(d, i)
    const y2 = yScale(graphMinBpm)

    bpmGraph.append('line')
      .attr('x1', x)
      .attr('y1', y1)
      .attr('x2', x)
      .attr('y2', y2)
      .attr('class', 'cue-point')
  })
}

export { bpmGraph }
