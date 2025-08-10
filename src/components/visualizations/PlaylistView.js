import React from 'react'

function PlaylistView ({ songs }) {
  return (
    <div className='playlist'>
      <span>Songs:</span>
      <ol>
        {songs.map((song, index) => (
          <li key={index} className='song'>
            <span className='title'>{song.Title || 'Unknown'}</span>
            {song.Remix && !(song.Title || 'Unknown').includes(song.Remix) && (
              <span className='remix'>{song.Remix}</span>
            )}
            <span className='artist'>{song.Artist || 'Unknown'}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default PlaylistView
