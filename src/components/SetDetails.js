import React from 'react'

function SetDetails ({ setMetadata }) {
  const getBpmLabel = () => {
    if (setMetadata.bpmMin && setMetadata.bpmMax) {
      if (Math.round(setMetadata.bpmMin) === Math.round(setMetadata.bpmMax)) {
        return `${Math.round(setMetadata.bpmMin)} BPM`
      } else {
        return `${Math.round(setMetadata.bpmMin)} - ${Math.round(setMetadata.bpmMax)} BPM`
      }
    }
    return ''
  }

  const getRuntimeLabel = () => {
    if (setMetadata.length) {
      return `${Math.round(setMetadata.length / 60)} minutes`
    }
    return ''
  }

  return (
    <div className='set-details'>
      {getBpmLabel() && <span className='bpm'>{getBpmLabel()}</span>}
      {getRuntimeLabel() && <span className='runtime'>{getRuntimeLabel()}</span>}
    </div>
  )
}

export default SetDetails
