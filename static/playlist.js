function getEnergy (data, index) {
  return data.Energy || 0
}

function getSongMeta (data, index) {
  const artist = data.Artist || 'Unknown'
  const title = data.Title || 'Unknown'
  return `${artist} - ${title}`
}

function playlistGraph (container, songs, setMetadata) {
  // Build the playlist group
  const playlist = container
    .append('div')
    .attr('class', 'timeline')

  // Map data to divs
  const song = playlist.selectAll('div')
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

  song.on('mouseover', function (d, i) {
    // Show this tooltip
    tooltip.classed('invisible', false)

    tooltip.attr('data-energy', getEnergy(d, i))
      .text(`${d.Title || 'Unknown'} by ${d.Artist || 'Unknown'}`)
  })

  song.on('mouseout', function (d, i) {
    tooltip.classed('invisible', true)
  })
}
