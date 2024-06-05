function timelineGraph (container, songs, pois, setMetadata, index) {
  // Dimensions / constant
  const graphHeight = 50
  const graphWidth = 500
  const graphMinBpm = 50
  const graphMaxBpm = 100

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, setMetadata.length])
    .range([0, graphWidth])

  const yScale = d3.scaleLinear()
    .domain([graphMinBpm, graphMaxBpm])
    .range([graphHeight, 0])

  const gradientScale = d3.scaleLinear()
    .domain([0, setMetadata.length])
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

  // Build the timeline group
  const timeline = container
    .append('svg')
    .attr('class', 'poi-timeline svg-content-responsive')
  // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `0 0 ${graphWidth} ${graphHeight}`)

  // Create gradient
  const gradientId = `gradient-${index}`
  const gradient = timeline.append('defs')
    .append('linearGradient')
    .attr('id', gradientId)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', graphWidth)
    .attr('y2', 0)

  // Add stops
  function addColorStop (pos, energy) {
    const mapper = {
      0: 'grey',
      1: 'blue',
      2: 'green',
      3: 'yellow',
      4: 'orange',
      5: 'red'
    }
    gradient.append('stop')
    // .attr('offset', xScale(pos))
      .attr('offset', gradientScale(pos) + '%')
      .attr('stop-color', mapper[energy])
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

  // Add energy stops for each cue point
  cuePoints.forEach((d, i) => {
    const energy = d.energy
    const pos = d.timestamp
    addColorStop(pos, energy)
  })

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
    .attr('fill', `url(#${gradientId})`)
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
}
