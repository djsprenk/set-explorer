import React from 'react'

function SetThumbnail ({ setMetadata }) {
  if (!setMetadata.img) return null

  return (
    <a className='set-thumbnail-link' href={setMetadata.url}>
      <img
        className='set-thumbnail'
        src={setMetadata.img}
        alt={setMetadata.title}
        title={setMetadata.title}
      />
    </a>
  )
}

export default SetThumbnail
