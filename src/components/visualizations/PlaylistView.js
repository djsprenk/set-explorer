import React from 'react'

function PlaylistView ({ songs }) {
  return (
    <div className='playlist'>
      <span>Songs:</span>
      <ol>
        {songs.map((song, index) => {
          const title = song.Title || 'Unknown'
          const remix = song.Remix
          const artist = song.Artist || 'Unknown'

          // Only show remix if it exists, is not empty, is not NaN, and is not already included in title
          const shouldShowRemix = Boolean(remix) &&
            typeof remix === 'string' &&
            remix.trim() !== '' &&
            !title.includes(remix)

          return (
            <li key={index} className='song'>
              <span className='title'>{title}</span>
              {shouldShowRemix && (
                <span className='remix'>{song.Remix}</span>
              )}
              <span className='artist'>{artist}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default PlaylistView
