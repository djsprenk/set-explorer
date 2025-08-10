import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function BpmGraph ({ songs, pois, setMetadata, index, scale }) {
  const svgRef = useRef()

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous render

    // Get just cue points from list
    function filterPois (list, type) {
      return list.filter(item => item.type === type)
    }

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

    function getYPos (d, i) {
      const effectiveBpm = Math.min(d.bpm, 1)
      return yScale(effectiveBpm)
    }

    // Set responsive SVG attributes
    svg
      .attr('class', 'bpm-graph svg-content-responsive')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${graphWidth} ${graphHeight}`)

    // Create gradient
    const gradientId = `bpm-gradient-${index}`
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', graphWidth)
      .attr('y2', 0)

    const colorScale = d3.scaleLinear()
      .domain([0, 60, 65, 70, 75, 80, 85])
      .range(['black', 'purple', 'blue', 'green', 'yellow', 'orange', 'red'])
      .interpolate(d3.interpolateRgb)

    // Add stops
    const bpmChanges = filterPois(pois, 'beatgrid')

    function addColorStop (pos, bpm) {
      gradient.append('stop')
        .attr('offset', gradientScale(pos) + '%')
        .attr('stop-color', colorScale(bpm))
    }

    // Add stops
    bpmChanges.forEach((bpmChange) => {
      const bpm = bpmChange.bpm
      const pos = bpmChange.timestamp
      addColorStop(pos, bpm)
    })

    const cuePoints = filterPois(pois, 'cue')

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
    const bottomLeftPoint = { timestamp: 0, bpm: 0 }
    const topLeftPoint = { timestamp: 0, bpm: 1 }
    const topRightPoint = { timestamp: setMetadata.length, bpm: 1 }
    const bottomRightPoint = { timestamp: setMetadata.length, bpm: 0 }
    const poisPoints = [bottomLeftPoint, topLeftPoint, ...pois, topRightPoint, bottomRightPoint]

    // Draw the path and add fill
    svg.append('path')
      .datum(poisPoints)
      .attr('d', line)
      .attr('fill', `url(#${gradientId})`)

    // Add cue point lines for each cue point
    cuePoints.forEach((d, i) => {
      const x = getXPos(d, i)
      const y1 = graphHeight
      const y2 = 0

      svg.append('line')
        .attr('x1', x)
        .attr('y1', y1)
        .attr('x2', x)
        .attr('y2', y2)
        .attr('class', 'cue-point')
    })
  }, [songs, pois, setMetadata, index, scale])

  return (
    <div className='bpm-container'>
      <span className='graph-label'>BPM</span>
      <svg ref={svgRef} />
    </div>
  )
}

export default BpmGraph
