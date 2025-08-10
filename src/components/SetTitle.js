import React from 'react'

function SetTitle ({ setName, setSubtitle, url }) {
  const titleContent = (
    <>
      <div className='set-name'>{setName}</div>
      <div className='set-subtitle'>{setSubtitle}</div>
    </>
  )

  if (url) {
    return (
      <a href={url} className='set-title'>
        {titleContent}
      </a>
    )
  }

  return (
    <div className='set-title'>
      {titleContent}
    </div>
  )
}

export default SetTitle
