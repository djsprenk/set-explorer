import * as d3 from 'd3'

function playlistView (container, songs, setMetadata) {
  // Build the playlist listing
  const playlist = container
    .append('div')
    .attr('class', 'playlist')
    .text('Songs:')
    .append('ol')

  // Map data to list items
  playlist.selectAll('div')
    .data(songs)
    .join('li')
    .attr('class', 'song')
    .each(function (d) {
      const songElement = d3.select(this)
      songElement.append('span')
        .attr('class', 'title')
        .text(d.Title || 'Unknown')
      songElement.append('span')
        .attr('class', 'artist')
        .text(d.Artist || 'Unknown')
    })
}

export { playlistView }
